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
  selectedPlayer: Player | null = null;
  selectedTeam: Team | null = null;
  showRevealAnimation: boolean = false;
  animationPhase: 'smoke' | 'flash' | 'reveal' = 'smoke';
  waitingRoomWindow: Window | null = null;
  animationSpeed: 'slow' | 'normal' | 'fast' = 'normal';

  constructor(
    private csvParser: CsvParserService,
    private dispatcher: TeamDispatcherService
  ) {}

  setAnimationSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.animationSpeed = speed;
  }

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

  exportToText(): void {
    if (this.teams.length === 0) {
      alert('Aucune équipe à exporter. Veuillez d\'abord charger un fichier.');
      return;
    }

    let textContent = '═══════════════════════════════════════════════\n';
    textContent += '🎄   DISPATCH DES ÉQUIPES - LUDI IMPROVISEM   🎄\n';
    textContent += '═══════════════════════════════════════════════\n\n';

    this.teams.forEach((team, index) => {
      const teamIcon = this.getTeamIcon(team.name);
      textContent += `${teamIcon} ÉQUIPE ${team.name.toUpperCase()} ${teamIcon}\n`;
      textContent += `Score total: ${team.totalScore.toFixed(2)} | Joueurs: ${team.players.length}\n`;
      textContent += '─────────────────────────────────────────────\n';
      
      team.players.forEach((player, playerIndex) => {
        const motivationLabel = this.getMotivationLabel(player.motivation);
        const disponibiliteLabel = this.getDisponibiliteLabel(player.disponibilite);
        textContent += `${playerIndex + 1}. ${player.prenom} ${player.nom}\n`;
        textContent += `   Motivation: ${motivationLabel}\n`;
        textContent += `   Disponibilité: ${disponibiliteLabel}\n`;
        textContent += `   Score: ${player.score.toFixed(2)}\n`;
        if (playerIndex < team.players.length - 1) {
          textContent += '\n';
        }
      });
      
      if (index < this.teams.length - 1) {
        textContent += '\n\n';
      }
    });

    textContent += '\n\n═══════════════════════════════════════════════\n';
    textContent += 'STATISTIQUES GLOBALES\n';
    textContent += '═══════════════════════════════════════════════\n';
    textContent += this.explanation;

    // Créer un blob et déclencher le téléchargement
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `dispatch-equipes-${dateStr}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTeamIcon(teamName: string): string {
    switch (teamName) {
      case 'Noirs': return '⚫';
      case 'Jaune': return '🟡';
      case 'Rouge': return '🔴';
      case 'Blanc': return '⚪';
      default: return '🔵';
    }
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

  // Ouvrir la salle d'attente pour le public
  openWaitingRoom(): void {
    const width = 700;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    this.waitingRoomWindow = window.open(
      '', 
      'WaitingRoom',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
    );

    if (!this.waitingRoomWindow) {
      alert('Veuillez autoriser les popups pour afficher la salle d\'attente !');
      return;
    }

    // Créer le contenu HTML de la salle d'attente
    const html = this.generateWaitingRoomHTML();
    this.waitingRoomWindow.document.write(html);
    this.waitingRoomWindow.document.close();
  }

  // Animation de révélation dans une nouvelle fenêtre
  onPlayerClick(player: Player, team: Team): void {
    // Ne pas ouvrir si on est en train de drag
    if (this.draggedPlayer) {
      return;
    }

    // Utiliser la fenêtre de salle d'attente si elle existe, sinon en créer une nouvelle
    let revealWindow: Window | null = null;
    
    if (this.waitingRoomWindow && !this.waitingRoomWindow.closed) {
      // Réutiliser la fenêtre existante
      revealWindow = this.waitingRoomWindow;
    } else {
      // Ouvrir une nouvelle fenêtre popup
      const width = 700;
      const height = 800;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      revealWindow = window.open(
        '', 
        'TeamReveal',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
      );
    }

    if (!revealWindow) {
      alert('Veuillez autoriser les popups pour voir la révélation !');
      return;
    }

    // Créer le contenu HTML de la fenêtre
    const html = this.generateRevealHTML(player, team);
    revealWindow.document.open();
    revealWindow.document.write(html);
    revealWindow.document.close();
  }

  private generateWaitingRoomHTML(): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salle d'attente - LUDI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .waiting-container {
      text-align: center;
      color: white;
      animation: fadeIn 1s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .waiting-icons {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 50px;
      font-size: 5em;
      animation: iconsFloat 3s ease-in-out infinite;
    }

    @keyframes iconsFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-30px); }
    }

    .waiting-title {
      font-size: 3.5em;
      color: #FFD700;
      margin-bottom: 30px;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }

    .waiting-subtitle {
      font-size: 2em;
      color: #fff;
      margin-bottom: 60px;
      opacity: 0.9;
      animation: fadeInOut 3s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    .snowflake {
      position: absolute;
      color: white;
      font-size: 2em;
      opacity: 0.8;
      animation: fall linear infinite;
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }

    .loading-dots {
      font-size: 3em;
      margin-top: 40px;
    }

    .loading-dots span {
      animation: blink 1.5s infinite;
      display: inline-block;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: 0.3s;
    }

    .loading-dots span:nth-child(3) {
      animation-delay: 0.6s;
    }

    @keyframes blink {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .christmas-lights {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 50px;
      font-size: 2em;
    }

    .light {
      animation: lightBlink 1s infinite;
    }

    .light:nth-child(2) { animation-delay: 0.2s; }
    .light:nth-child(3) { animation-delay: 0.4s; }
    .light:nth-child(4) { animation-delay: 0.6s; }
    .light:nth-child(5) { animation-delay: 0.8s; }

    @keyframes lightBlink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
  </style>
</head>
<body>
  ${Array.from({ length: 20 }, (_, i) => `
    <div class="snowflake" style="left: ${Math.random() * 100}%; animation-duration: ${5 + Math.random() * 5}s; animation-delay: ${Math.random() * 5}s;">
      ❄
    </div>
  `).join('')}

  <div class="waiting-container">
    <div class="waiting-icons">
      🎄 🎁 ⭐
    </div>
    <h1 class="waiting-title">🎅 Bienvenue ! 🎁</h1>
    <p class="waiting-subtitle">La révélation des équipes va commencer...</p>
    <div class="loading-dots">
      <span>•</span>
      <span>•</span>
      <span>•</span>
    </div>
    <div class="christmas-lights">
      <span class="light">🔴</span>
      <span class="light">🟡</span>
      <span class="light">🟢</span>
      <span class="light">🔵</span>
      <span class="light">🟣</span>
    </div>
  </div>
</body>
</html>
    `;
  }

  private generateRevealHTML(player: Player, team: Team): string {
    const textColor = team.name === 'Blanc' ? '#000' : '#fff';
    
    // Calcul des durées d'animation en fonction de la vitesse
    const speedMultiplier = this.animationSpeed === 'slow' ? 1.5 : this.animationSpeed === 'fast' ? 0.5 : 1;
    const giftDuration = 2 * speedMultiplier;
    const giftDisappearDelay = 2 * speedMultiplier;
    const openingDelay = 2 * speedMultiplier;
    const openingFadeDelay = 3 * speedMultiplier;
    const contentDelay = 3 * speedMultiplier;
    const buttonDelay = 3.8 * speedMultiplier;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Révélation - ${player.prenom} ${player.nom}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    /* Flocons de neige */
    .snowflake {
      position: absolute;
      top: -10px;
      color: white;
      font-size: 1.5em;
      opacity: 0.8;
      animation: fall linear infinite;
    }

    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }

    .reveal-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Phase 1: Cadeau de Noël qui brille */
    .reveal-gift {
      width: 100%;
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeOut ${0.5 * speedMultiplier}s ease-out ${giftDisappearDelay}s forwards;
    }

    .gift-box {
      width: 250px;
      height: 250px;
      position: relative;
      animation: giftShake ${0.5 * speedMultiplier}s ease-in-out ${1.5 * speedMultiplier}s;
    }

    @keyframes giftShake {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-5deg); }
      75% { transform: rotate(5deg); }
    }

    .gift-base {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
      border-radius: 10px;
      position: relative;
      box-shadow: 0 20px 60px rgba(196, 30, 58, 0.6);
      animation: giftFloat ${giftDuration}s ease-in-out infinite;
    }

    @keyframes giftFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }

    .gift-ribbon-v {
      position: absolute;
      width: 40px;
      height: 100%;
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
      left: 50%;
      transform: translateX(-50%);
      box-shadow: inset -2px 0 5px rgba(0,0,0,0.3);
    }

    .gift-ribbon-h {
      position: absolute;
      width: 100%;
      height: 40px;
      background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
      top: 50%;
      transform: translateY(-50%);
      box-shadow: inset 0 -2px 5px rgba(0,0,0,0.3);
    }

    .gift-bow {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      animation: bowBounce 1s ease-in-out infinite;
    }

    @keyframes bowBounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }

    .bow-loop {
      width: 60px;
      height: 50px;
      background: #FFD700;
      border-radius: 50% 50% 0 0;
      position: absolute;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .bow-loop-left {
      left: -30px;
      transform: rotate(-30deg);
    }

    .bow-loop-right {
      right: -30px;
      transform: rotate(30deg);
    }

    .bow-knot {
      width: 40px;
      height: 40px;
      background: #FFA500;
      border-radius: 50%;
      position: absolute;
      top: 25px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .gift-sparkle {
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      animation: sparkle 1.5s ease-in-out infinite;
    }

    .sparkle-1 { top: 10%; left: 15%; animation-delay: 0s; }
    .sparkle-2 { top: 20%; right: 15%; animation-delay: 0.3s; }
    .sparkle-3 { bottom: 20%; left: 20%; animation-delay: 0.6s; }
    .sparkle-4 { bottom: 15%; right: 20%; animation-delay: 0.9s; }

    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }

    /* FUMÉE MAGIQUE INTENSE qui s'échappe du cadeau */
    .magic-smoke {
      position: absolute;
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.7) 0%, rgba(255, 165, 0, 0.5) 30%, rgba(255, 100, 0, 0.3) 60%, transparent 80%);
      border-radius: 50%;
      filter: blur(15px);
      animation: smokeRise 1.8s ease-out infinite;
    }

    .smoke-1 { left: 10%; animation-delay: 0s; }
    .smoke-2 { left: 25%; animation-delay: 0.2s; }
    .smoke-3 { left: 40%; animation-delay: 0.4s; }
    .smoke-4 { left: 55%; animation-delay: 0.6s; }
    .smoke-5 { left: 70%; animation-delay: 0.8s; }
    .smoke-6 { left: 85%; animation-delay: 1s; }
    .smoke-7 { left: 15%; animation-delay: 0.3s; }
    .smoke-8 { left: 50%; animation-delay: 0.5s; }
    .smoke-9 { left: 65%; animation-delay: 0.7s; }
    .smoke-10 { left: 80%; animation-delay: 0.9s; }
    .smoke-11 { left: 20%; animation-delay: 0.1s; }
    .smoke-12 { left: 45%; animation-delay: 0.35s; }
    .smoke-13 { left: 60%; animation-delay: 0.55s; }
    .smoke-14 { left: 75%; animation-delay: 0.75s; }
    .smoke-15 { left: 30%; animation-delay: 0.15s; }

    @keyframes smokeRise {
      0% {
        bottom: 40%;
        opacity: 0;
        transform: scale(0.3) translateX(0) rotate(0deg);
      }
      20% {
        opacity: 0.8;
      }
      100% {
        bottom: 110%;
        opacity: 0;
        transform: scale(2.5) translateX(40px) rotate(180deg);
      }
    }

    /* Particules supplémentaires de fumée */
    .smoke-particle {
      position: absolute;
      width: 60px;
      height: 60px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 215, 0, 0.4) 40%, transparent 70%);
      border-radius: 50%;
      filter: blur(10px);
      animation: particleFloat 2s ease-out infinite;
    }

    .particle-1 { left: 5%; animation-delay: 0.1s; }
    .particle-2 { left: 30%; animation-delay: 0.4s; }
    .particle-3 { left: 50%; animation-delay: 0.7s; }
    .particle-4 { left: 70%; animation-delay: 1s; }
    .particle-5 { left: 90%; animation-delay: 0.2s; }
    .particle-6 { left: 15%; animation-delay: 0.5s; }
    .particle-7 { left: 60%; animation-delay: 0.8s; }
    .particle-8 { left: 80%; animation-delay: 0.3s; }

    @keyframes particleFloat {
      0% {
        bottom: 45%;
        opacity: 0;
        transform: scale(0.2) translateX(0);
      }
      30% {
        opacity: 0.9;
      }
      100% {
        bottom: 115%;
        opacity: 0;
        transform: scale(1.8) translateX(-40px);
      }
    }

    @keyframes fadeOut {
      to { opacity: 0; visibility: hidden; }
    }

    /* Phase 2: EXPLOSION ULTRA INTENSE avec FLASH AVEUGLANT */
    .reveal-opening {
      width: 100%;
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: openingAppear ${0.2 * speedMultiplier}s ease-out ${openingDelay}s forwards, fadeOut ${0.8 * speedMultiplier}s ease-out ${2.8 * speedMultiplier}s forwards;
    }

    @keyframes openingAppear {
      to { opacity: 1; }
    }

    /* FLASH BLANC ULTRA INTENSE - Triple effet */
    .white-flash {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, white 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.7) 60%, transparent 100%);
      animation: megaFlashPulse ${0.6 * speedMultiplier}s ease-out forwards;
      z-index: 20;
    }

    @keyframes megaFlashPulse {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      25% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.9;
        transform: scale(1.2);
      }
      75% {
        opacity: 0.7;
        transform: scale(1.5);
      }
      100% {
        opacity: 0;
        transform: scale(2);
      }
    }

    /* Flash secondaire pour effet de rebond */
    .flash-secondary {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, #FFD700 0%, #FFA500 40%, transparent 70%);
      animation: secondaryFlash 0.5s ease-out 0.1s forwards;
      z-index: 19;
    }

    @keyframes secondaryFlash {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 0.8;
      }
      100% {
        opacity: 0;
        transform: scale(3);
      }
    }

    /* Explosion centrale MASSIVE */
    .opening-burst {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, 
        white 0%, 
        #FFD700 20%, 
        #FFA500 40%, 
        #FF6B00 60%, 
        transparent 80%);
      border-radius: 50%;
      animation: megaBurstExpand 0.7s ease-out forwards;
      box-shadow: 
        0 0 150px #FFD700, 
        0 0 300px #FFA500,
        0 0 450px #FF6B00,
        inset 0 0 100px white;
      z-index: 15;
    }

    @keyframes megaBurstExpand {
      0% {
        transform: scale(0) rotate(0deg);
        opacity: 1;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(25) rotate(360deg);
        opacity: 0;
      }
    }

    /* Ondes de choc multiples */
    .shockwave {
      position: absolute;
      width: 100px;
      height: 100px;
      border: 4px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: shockwaveExpand 0.8s ease-out forwards;
      z-index: 18;
    }

    .shockwave-1 { animation-delay: 0s; }
    .shockwave-2 { animation-delay: 0.15s; }
    .shockwave-3 { animation-delay: 0.3s; }

    @keyframes shockwaveExpand {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(20);
        opacity: 0;
      }
    }

    /* Rayons de lumière ULTRA NOMBREUX */
    .light-rays {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 17;
    }

    .light-ray {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 400px;
      background: linear-gradient(to bottom, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(255, 215, 0, 0.7) 30%, 
        rgba(255, 165, 0, 0.5) 60%,
        transparent 100%);
      transform-origin: top center;
      animation: megaRayExpand 0.6s ease-out forwards;
      filter: blur(2px);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    }

    @keyframes megaRayExpand {
      0% {
        height: 0;
        opacity: 1;
        width: 10px;
      }
      50% {
        width: 15px;
      }
      100% {
        height: 500px;
        opacity: 0;
        width: 5px;
      }
    }

    ${Array.from({ length: 24 }, (_, i) => `
      .light-ray:nth-child(${i + 1}) { 
        transform: rotate(${i * 15}deg) translateY(-250px);
        animation-delay: ${(i % 4) * 0.05}s;
      }
    `).join('')}

    /* Particules d'explosion */
    .explosion-particle {
      position: absolute;
      width: 15px;
      height: 15px;
      background: radial-gradient(circle, white, #FFD700);
      border-radius: 50%;
      box-shadow: 0 0 15px #FFD700;
      animation: particleExplosion 0.8s ease-out forwards;
    }

    @keyframes particleExplosion {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    ${Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * 360;
      const distance = 200 + (i % 3) * 50;
      return `
      .explosion-particle:nth-child(${i + 1}) { 
        left: 50%; 
        top: 50%;
        animation-delay: ${(i % 5) * 0.03}s;
        transform: translate(-50%, -50%) translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) scale(${0.5 + (i % 3) * 0.3});
      }`;
    }).join('')}

    .stars {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .star {
      position: absolute;
      color: #FFD700;
      font-size: 2em;
      animation: starBurst 0.6s ease-out forwards;
    }

    @keyframes starBurst {
      0% {
        transform: translate(-50%, -50%) scale(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    .star:nth-child(1) { left: 50%; top: 50%; animation-delay: 0s; transform: translate(-50%, -50%) translate(-100px, -100px) scale(1) rotate(360deg); }
    .star:nth-child(2) { left: 50%; top: 50%; animation-delay: 0.05s; transform: translate(-50%, -50%) translate(100px, -100px) scale(1) rotate(360deg); }
    .star:nth-child(3) { left: 50%; top: 50%; animation-delay: 0.1s; transform: translate(-50%, -50%) translate(-100px, 100px) scale(1) rotate(360deg); }
    .star:nth-child(4) { left: 50%; top: 50%; animation-delay: 0.15s; transform: translate(-50%, -50%) translate(100px, 100px) scale(1) rotate(360deg); }
    .star:nth-child(5) { left: 50%; top: 50%; animation-delay: 0.2s; transform: translate(-50%, -50%) translate(0, -120px) scale(1) rotate(360deg); }
    .star:nth-child(6) { left: 50%; top: 50%; animation-delay: 0.25s; transform: translate(-50%, -50%) translate(0, 120px) scale(1) rotate(360deg); }

    /* Phase 3: Révélation avec flocons */
    .reveal-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      opacity: 0;
      animation: revealFadeIn ${0.6 * speedMultiplier}s ease-out ${2.5 * speedMultiplier}s forwards;
    }

    @keyframes revealFadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .snow-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .snow {
      position: absolute;
      color: white;
      font-size: 1.5em;
      top: -10px;
      animation: snowFall linear infinite;
      opacity: 0.8;
    }

    @keyframes snowFall {
      0% {
        top: -10px;
        opacity: 0.8;
      }
      100% {
        top: 100vh;
        opacity: 0.3;
      }
    }

    ${Array.from({ length: 15 }, (_, i) => `
      .snow:nth-child(${i + 1}) { 
        left: ${(i + 1) * 6.5}%; 
        animation-duration: ${3 + (i % 5)}s;
        animation-delay: ${(i % 3) * 0.5}s;
        font-size: ${0.8 + (i % 3) * 0.3}em;
      }
    `).join('')}

    .jersey-container {
      position: relative;
      margin-bottom: 30px;
      animation: jerseyAppear 0.8s ease-out 2s backwards;
    }

    @keyframes jerseyAppear {
      0% {
        transform: scale(0) rotateY(180deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotateY(0deg);
      }
      100% {
        transform: scale(1) rotateY(0deg);
        opacity: 1;
      }
    }

    .jersey-glow {
      position: absolute;
      inset: -30px;
      border-radius: 50%;
      filter: blur(20px);
      box-shadow: 0 0 80px ${team.color};
      animation: jerseyGlow 2s ease-in-out infinite;
    }

    @keyframes jerseyGlow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .jersey {
      width: 200px;
      height: 250px;
      filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
      animation: jerseyFloat 3s ease-in-out infinite;
    }

    @keyframes jerseyFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .team-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 1.5em;
      font-weight: bold;
      text-transform: uppercase;
      background-color: ${team.color};
      color: ${textColor};
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      animation: badgePop 0.5s ease-out 2.8s backwards;
    }

    @keyframes badgePop {
      0% {
        transform: translate(-50%, -50%) scale(0);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .congratulations {
      text-align: center;
      color: white;
      z-index: 10;
    }

    .congrats-title {
      font-size: 2.5em;
      margin: 0 0 20px 0;
      animation: titleBounce 0.6s ease-out 3s backwards;
    }

    @keyframes titleBounce {
      0% {
        transform: translateY(-50px);
        opacity: 0;
      }
      60% {
        transform: translateY(10px);
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .player-name-reveal {
      font-size: 2em;
      margin: 10px 0;
      color: #ffd700;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
      animation: nameFadeIn 0.5s ease-out 3.2s backwards;
    }

    @keyframes nameFadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .team-announcement {
      font-size: 1.3em;
      margin: 20px 0;
      animation: announceFadeIn 0.5s ease-out 3.4s backwards;
    }

    @keyframes announceFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .player-stats-reveal {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin: 20px 0;
      animation: statsFadeIn 0.5s ease-out 3.6s backwards;
    }

    @keyframes statsFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stat-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 10px 15px;
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .stat-icon {
      font-size: 1.5em;
    }

    .stat-text {
      font-size: 0.9em;
    }

    .close-reveal-btn {
      margin-top: 30px;
      padding: 15px 40px;
      font-size: 1.2em;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      animation: buttonFadeIn ${0.5 * speedMultiplier}s ease-out ${buttonDelay}s backwards;
    }

    @keyframes buttonFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .close-reveal-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
  </style>
</head>
<body>
  <div class="reveal-container">
    <!-- Phase 1: Cadeau de Noël avec BEAUCOUP de fumée magique -->
    <div class="reveal-gift">
      <div class="gift-box">
        <div class="gift-base">
          <div class="gift-ribbon-v"></div>
          <div class="gift-ribbon-h"></div>
          <div class="gift-sparkle sparkle-1"></div>
          <div class="gift-sparkle sparkle-2"></div>
          <div class="gift-sparkle sparkle-3"></div>
          <div class="gift-sparkle sparkle-4"></div>
          <!-- FUMÉE MAGIQUE INTENSE (15 particules) -->
          ${Array.from({ length: 15 }, (_, i) => `<div class="magic-smoke smoke-${i + 1}"></div>`).join('')}
          <!-- Particules supplémentaires (8 particules) -->
          ${Array.from({ length: 8 }, (_, i) => `<div class="smoke-particle particle-${i + 1}"></div>`).join('')}
        </div>
        <div class="gift-bow">
          <div class="bow-loop bow-loop-left"></div>
          <div class="bow-loop bow-loop-right"></div>
          <div class="bow-knot"></div>
        </div>
      </div>
    </div>

    <!-- Phase 2: EXPLOSION MEGA INTENSE avec FLASH AVEUGLANT -->
    <div class="reveal-opening">
      <!-- Triple flash -->
      <div class="white-flash"></div>
      <div class="flash-secondary"></div>
      
      <!-- Ondes de choc -->
      <div class="shockwave shockwave-1"></div>
      <div class="shockwave shockwave-2"></div>
      <div class="shockwave shockwave-3"></div>
      
      <!-- Explosion centrale -->
      <div class="opening-burst"></div>
      
      <!-- 24 rayons de lumière -->
      <div class="light-rays">
        ${Array.from({ length: 24 }, () => '<div class="light-ray"></div>').join('')}
      </div>
      
      <!-- 30 particules d'explosion -->
      ${Array.from({ length: 30 }, () => '<div class="explosion-particle"></div>').join('')}
      
      <!-- Étoiles -->
      <div class="stars">
        <div class="star">⭐</div>
        <div class="star">⭐</div>
        <div class="star">⭐</div>
        <div class="star">⭐</div>
        <div class="star">⭐</div>
        <div class="star">⭐</div>
      </div>
    </div>

    <!-- Phase 3: Révélation avec neige -->
    <div class="reveal-content">
      <div class="snow-container">
        ${Array.from({ length: 15 }, () => '<div class="snow">❄</div>').join('')}
      </div>
      
      <div class="jersey-container">
        <div class="jersey-glow"></div>
        <svg class="jersey" viewBox="0 0 200 250" style="fill: ${team.color};">
          <path d="M 50 50 L 30 80 L 30 150 L 50 180 L 150 180 L 170 150 L 170 80 L 150 50 Z" />
          <path d="M 50 50 L 30 80 L 10 70 L 30 40 Z" />
          <path d="M 150 50 L 170 80 L 190 70 L 170 40 Z" />
          <path d="M 85 50 L 80 60 L 90 70 L 100 65 L 110 70 L 120 60 L 115 50 Z" 
                style="fill: ${textColor};" />
        </svg>
        
        <div class="team-badge">
          ${team.name}
        </div>
      </div>

      <div class="congratulations">
        <h2 class="congrats-title">� Joyeux Noël ! �</h2>
        <h3 class="player-name-reveal">
          ${player.prenom} ${player.nom}
        </h3>
        <p class="team-announcement">
          Tu fais partie de l'équipe <strong style="color: ${team.color};">${team.name}</strong> !
        </p>
        <button class="close-reveal-btn" onclick="window.close()">Fermer</button>
      </div>
    </div>
  </div>

</body>
</html>
    `;
  }
}
