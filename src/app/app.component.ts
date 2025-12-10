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

  // Animation de révélation dans une nouvelle fenêtre
  onPlayerClick(player: Player, team: Team): void {
    // Ne pas ouvrir si on est en train de drag
    if (this.draggedPlayer) {
      return;
    }

    // Ouvrir une nouvelle fenêtre popup
    const width = 700;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    const revealWindow = window.open(
      '', 
      'TeamReveal',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
    );

    if (!revealWindow) {
      alert('Veuillez autoriser les popups pour voir la révélation !');
      return;
    }

    // Créer le contenu HTML de la fenêtre
    const html = this.generateRevealHTML(player, team);
    revealWindow.document.write(html);
    revealWindow.document.close();
  }

  private generateRevealHTML(player: Player, team: Team): string {
    const textColor = team.name === 'Blanc' ? '#000' : '#fff';

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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .reveal-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Phase 1: Fumée */
    .reveal-smoke {
      width: 100%;
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeOut 1.5s ease-out 1.5s forwards;
    }

    .mystery-box {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      animation: float 2s ease-in-out infinite, pulse 1.5s ease-in-out infinite;
      box-shadow: 0 10px 50px rgba(102, 126, 234, 0.5);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .box-glow {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      animation: glowPulse 2s ease-in-out infinite;
    }

    @keyframes glowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .box-content {
      font-size: 120px;
      font-weight: bold;
      color: white;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
      animation: questionRotate 3s ease-in-out infinite;
    }

    @keyframes questionRotate {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }

    .smoke-particle {
      position: absolute;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: smokeRise 1.5s ease-out infinite;
    }

    .smoke-1 { left: 20%; animation-delay: 0s; }
    .smoke-2 { left: 40%; animation-delay: 0.3s; }
    .smoke-3 { left: 60%; animation-delay: 0.6s; }
    .smoke-4 { left: 30%; animation-delay: 0.9s; }
    .smoke-5 { left: 70%; animation-delay: 1.2s; }

    @keyframes smokeRise {
      0% {
        bottom: 20%;
        opacity: 0;
        transform: scale(0.5) translateX(0);
      }
      50% {
        opacity: 0.5;
      }
      100% {
        bottom: 80%;
        opacity: 0;
        transform: scale(1.5) translateX(50px);
      }
    }

    @keyframes fadeOut {
      to { opacity: 0; visibility: hidden; }
    }

    /* Phase 2: Flash */
    .reveal-flash {
      width: 100%;
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: flashAppear 0.5s ease-out 1.5s forwards, fadeOut 0.5s ease-out 2s forwards;
    }

    @keyframes flashAppear {
      to { opacity: 1; }
    }

    .flash-burst {
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, white 0%, transparent 70%);
      border-radius: 50%;
      animation: flashExpand 0.5s ease-out forwards;
    }

    @keyframes flashExpand {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(30);
        opacity: 0;
      }
    }

    .flash-rays {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .ray {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 200px;
      background: linear-gradient(to bottom, white, transparent);
      transform-origin: top center;
    }

    .ray:nth-child(1) { transform: rotate(0deg) translateY(-100px); }
    .ray:nth-child(2) { transform: rotate(30deg) translateY(-100px); }
    .ray:nth-child(3) { transform: rotate(60deg) translateY(-100px); }
    .ray:nth-child(4) { transform: rotate(90deg) translateY(-100px); }
    .ray:nth-child(5) { transform: rotate(120deg) translateY(-100px); }
    .ray:nth-child(6) { transform: rotate(150deg) translateY(-100px); }
    .ray:nth-child(7) { transform: rotate(180deg) translateY(-100px); }
    .ray:nth-child(8) { transform: rotate(210deg) translateY(-100px); }
    .ray:nth-child(9) { transform: rotate(240deg) translateY(-100px); }
    .ray:nth-child(10) { transform: rotate(270deg) translateY(-100px); }
    .ray:nth-child(11) { transform: rotate(300deg) translateY(-100px); }
    .ray:nth-child(12) { transform: rotate(330deg) translateY(-100px); }

    /* Phase 3: Révélation */
    .reveal-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      opacity: 0;
      animation: revealFadeIn 0.5s ease-out 2s forwards;
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

    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      top: -10px;
      animation: confettiFall 3s ease-out forwards;
    }

    .confetti:nth-child(odd) { background-color: #ff0; }
    .confetti:nth-child(3n) { background-color: #0ff; }
    .confetti:nth-child(4n) { background-color: #f00; }
    .confetti:nth-child(5n) { background-color: #0f0; }
    .confetti:nth-child(2n) { background-color: #f0f; }

    ${Array.from({ length: 20 }, (_, i) => `
      .confetti:nth-child(${i + 1}) { 
        left: ${(i + 1) * 5}%; 
        animation-delay: ${(i % 3) * 0.1}s; 
      }
    `).join('')}

    @keyframes confettiFall {
      0% {
        top: -10px;
        transform: rotateZ(0deg);
      }
      100% {
        top: 100%;
        transform: rotateZ(720deg);
      }
    }

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
      animation: buttonFadeIn 0.5s ease-out 3.8s backwards;
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
    <!-- Phase 1: Fumée -->
    <div class="reveal-smoke">
      <div class="smoke-particle smoke-1"></div>
      <div class="smoke-particle smoke-2"></div>
      <div class="smoke-particle smoke-3"></div>
      <div class="smoke-particle smoke-4"></div>
      <div class="smoke-particle smoke-5"></div>
      <div class="mystery-box">
        <div class="box-glow"></div>
        <div class="box-content">?</div>
      </div>
    </div>

    <!-- Phase 2: Flash -->
    <div class="reveal-flash">
      <div class="flash-burst"></div>
      <div class="flash-rays">
        ${Array.from({ length: 12 }, () => '<div class="ray"></div>').join('')}
      </div>
    </div>

    <!-- Phase 3: Révélation -->
    <div class="reveal-content">
      <div class="confetti-container">
        ${Array.from({ length: 20 }, () => '<div class="confetti"></div>').join('')}
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
        <h2 class="congrats-title">🎉 Félicitations ! 🎉</h2>
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
