import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvParserService } from './services/csv-parser.service';
import { TeamDispatcherService } from './services/team-dispatcher.service';
import { Team } from './models/player.model';

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
}
