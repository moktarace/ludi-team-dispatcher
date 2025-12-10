import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvParserService } from './services/csv-parser.service';
import { TeamDispatcherService } from './services/team-dispatcher.service';
import { Team, Player, PlayerSwapSuggestion } from './models/player.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'LUDI Team Dispatcher';
  teams: Team[] = [];
  explanation: string = '';
  isDragOver: boolean = false;
  errorMessage: string = '';
  showExplanation: boolean = false;
  draggedPlayer: Player | null = null;
  draggedFromTeamIndex: number = -1;
  dragOverTeamIndex: number = -1;
  swapSuggestions: PlayerSwapSuggestion[] = [];
  showSwapSuggestions: boolean = false;

  constructor(
    private csvParser: CsvParserService,
    private dispatcher: TeamDispatcherService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    this.errorMessage = '';

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Vérifier l'extension du fichier
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.tsv')) {
      this.errorMessage = 'Format de fichier non supporté. Veuillez utiliser un fichier .csv ou .tsv';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        
        // Parser le fichier
        const players = this.csvParser.parseFile(content);
        
        if (players.length === 0) {
          this.errorMessage = 'Aucun joueur trouvé dans le fichier';
          return;
        }

        // Dispatcher les joueurs
        const result = this.dispatcher.dispatchPlayers(players);
        this.teams = result.teams;
        this.explanation = result.explanation;
        this.errorMessage = '';
        
      } catch (error) {
        this.errorMessage = `Erreur lors du traitement du fichier : ${error}`;
        console.error(error);
      }
    };

    reader.onerror = () => {
      this.errorMessage = 'Erreur lors de la lecture du fichier';
    };

    reader.readAsText(file);
  }

  toggleExplanation(): void {
    this.showExplanation = !this.showExplanation;
  }

  getMotivationLabel(motivation: number): string {
    switch (motivation) {
      case 4: return '🔥 Super envie';
      case 3: return '🙂 Ça me tente';
      case 2: return '🤔 Ne sais pas';
      case 1: return '❄️ Pas pour le moment';
      default: return 'Inconnu';
    }
  }

  getDisponibiliteLabel(disponibilite: number): string {
    switch (disponibilite) {
      case 4: return '✅ Chaque fois';
      case 3: return '🔄 Peut s\'arranger';
      case 2: return '📅 De temps en temps';
      case 1: return '❌ Indisponible';
      default: return 'Inconnu';
    }
  }

  getTeamColorStyle(color: string): any {
    return {
      'border-left': `5px solid ${color}`,
      'border-color': color
    };
  }

  // Drag & Drop pour les joueurs
  onPlayerDragStart(event: DragEvent, player: Player, teamIndex: number): void {
    this.draggedPlayer = player;
    this.draggedFromTeamIndex = teamIndex;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onPlayerDragEnd(event: DragEvent): void {
    this.draggedPlayer = null;
    this.draggedFromTeamIndex = -1;
    this.dragOverTeamIndex = -1;
    this.swapSuggestions = [];
    this.showSwapSuggestions = false;
  }

  onTeamDragOver(event: DragEvent, teamIndex: number): void {
    if (this.draggedPlayer && this.draggedFromTeamIndex !== teamIndex) {
      event.preventDefault();
      event.stopPropagation();
      this.dragOverTeamIndex = teamIndex;
      
      // Calculer les suggestions d'échange
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    }
  }

  onTeamDragLeave(event: DragEvent, teamIndex: number): void {
    if (this.dragOverTeamIndex === teamIndex) {
      this.dragOverTeamIndex = -1;
    }
  }

  onTeamDrop(event: DragEvent, targetTeamIndex: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.draggedPlayer || this.draggedFromTeamIndex === targetTeamIndex) {
      return;
    }

    // Calculer les suggestions d'échange
    this.calculateSwapSuggestions(targetTeamIndex);
    this.showSwapSuggestions = true;
  }

  calculateSwapSuggestions(targetTeamIndex: number): void {
    if (!this.draggedPlayer) return;

    const targetTeam = this.teams[targetTeamIndex];
    const sourceTeam = this.teams[this.draggedFromTeamIndex];
    
    this.swapSuggestions = targetTeam.players.map(player => {
      // Calculer le nouveau score si on échange les deux joueurs
      const sourceTeamNewScore = sourceTeam.totalScore - this.draggedPlayer!.score + player.score;
      const targetTeamNewScore = targetTeam.totalScore + this.draggedPlayer!.score - player.score;
      const scoreDifference = Math.abs(sourceTeamNewScore - targetTeamNewScore);

      return {
        player,
        scoreDifference,
        newTeamScore: targetTeamNewScore,
        targetTeamScore: sourceTeamNewScore
      };
    }).sort((a, b) => a.scoreDifference - b.scoreDifference); // Trier par meilleur équilibre
  }

  swapPlayers(targetPlayer: Player): void {
    if (!this.draggedPlayer) return;

    const sourceTeam = this.teams[this.draggedFromTeamIndex];
    const targetTeam = this.teams[this.dragOverTeamIndex];

    // Trouver les index des joueurs
    const draggedPlayerIndex = sourceTeam.players.indexOf(this.draggedPlayer);
    const targetPlayerIndex = targetTeam.players.indexOf(targetPlayer);

    if (draggedPlayerIndex === -1 || targetPlayerIndex === -1) return;

    // Échanger les joueurs
    const temp = sourceTeam.players[draggedPlayerIndex];
    sourceTeam.players[draggedPlayerIndex] = targetTeam.players[targetPlayerIndex];
    targetTeam.players[targetPlayerIndex] = temp;

    // Recalculer les scores
    this.recalculateTeamStats(sourceTeam);
    this.recalculateTeamStats(targetTeam);

    // Réinitialiser
    this.draggedPlayer = null;
    this.draggedFromTeamIndex = -1;
    this.dragOverTeamIndex = -1;
    this.swapSuggestions = [];
    this.showSwapSuggestions = false;
  }

  movePlayerWithoutSwap(targetTeamIndex: number): void {
    if (!this.draggedPlayer) return;

    const sourceTeam = this.teams[this.draggedFromTeamIndex];
    const targetTeam = this.teams[targetTeamIndex];

    // Retirer le joueur de l'équipe source
    const playerIndex = sourceTeam.players.indexOf(this.draggedPlayer);
    if (playerIndex !== -1) {
      sourceTeam.players.splice(playerIndex, 1);
    }

    // Ajouter le joueur à l'équipe cible
    targetTeam.players.push(this.draggedPlayer);

    // Recalculer les scores
    this.recalculateTeamStats(sourceTeam);
    this.recalculateTeamStats(targetTeam);

    // Réinitialiser
    this.draggedPlayer = null;
    this.draggedFromTeamIndex = -1;
    this.dragOverTeamIndex = -1;
    this.swapSuggestions = [];
    this.showSwapSuggestions = false;
  }

  cancelSwap(): void {
    this.draggedPlayer = null;
    this.draggedFromTeamIndex = -1;
    this.dragOverTeamIndex = -1;
    this.swapSuggestions = [];
    this.showSwapSuggestions = false;
  }

  private recalculateTeamStats(team: Team): void {
    team.totalScore = team.players.reduce((sum, p) => sum + p.score, 0);
    team.avgMotivation = team.players.length > 0 
      ? team.players.reduce((sum, p) => sum + p.motivation, 0) / team.players.length 
      : 0;
    team.avgDisponibilite = team.players.length > 0 
      ? team.players.reduce((sum, p) => sum + p.disponibilite, 0) / team.players.length 
      : 0;
  }
}
