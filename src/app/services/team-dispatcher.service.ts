import { Injectable } from '@angular/core';
import { Player, Team, DispatchResult } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class TeamDispatcherService {

  private readonly TEAM_CONFIGS = [
    { name: 'Noirs', color: '#1a1a1a' },
    { name: 'Jaune', color: '#ffd700' },
    { name: 'Rouge', color: '#dc3545' },
    { name: 'Blanc', color: '#f8f9fa' }
  ];

  dispatchPlayers(players: Player[]): DispatchResult {
    // Initialiser les équipes
    const teams: Team[] = this.TEAM_CONFIGS.map(config => ({
      name: config.name,
      color: config.color,
      players: [],
      totalScore: 0,
      avgMotivation: 0,
      avgDisponibilite: 0
    }));

    // Trier les joueurs par score décroissant (les plus motivés/disponibles en premier)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    // Distribution équilibrée : snake draft
    // 1er tour : équipe 0, 1, 2, 3
    // 2ème tour : équipe 3, 2, 1, 0 (inversé)
    // 3ème tour : équipe 0, 1, 2, 3
    // etc.
    let teamIndex = 0;
    let direction = 1; // 1 = avant, -1 = arrière

    for (const player of sortedPlayers) {
      teams[teamIndex].players.push(player);
      teams[teamIndex].totalScore += player.score;

      // Avancer vers l'équipe suivante
      if (direction === 1) {
        teamIndex++;
        if (teamIndex >= teams.length) {
          teamIndex = teams.length - 1;
          direction = -1;
        }
      } else {
        teamIndex--;
        if (teamIndex < 0) {
          teamIndex = 0;
          direction = 1;
        }
      }
    }

    // Calculer les moyennes pour chaque équipe
    teams.forEach(team => {
      if (team.players.length > 0) {
        team.avgMotivation = team.players.reduce((sum, p) => sum + p.motivation, 0) / team.players.length;
        team.avgDisponibilite = team.players.reduce((sum, p) => sum + p.disponibilite, 0) / team.players.length;
      }
    });

    // Générer l'explication
    const explanation = this.generateExplanation(teams, players.length);

    return { teams, explanation };
  }

  private generateExplanation(teams: Team[], totalPlayers: number): string {
    const teamStats = teams.map(team => ({
      name: team.name,
      count: team.players.length,
      avgMotivation: team.avgMotivation.toFixed(2),
      avgDisponibilite: team.avgDisponibilite.toFixed(2),
      totalScore: team.totalScore.toFixed(1)
    }));

    let explanation = `📊 Distribution de ${totalPlayers} joueurs en 4 équipes équilibrées\n\n`;
    explanation += `🎯 Méthode : Snake Draft\n`;
    explanation += `Les joueurs sont triés par score (motivation + disponibilité), puis distribués en serpentin `;
    explanation += `pour garantir l'équité entre les équipes.\n\n`;
    
    explanation += `📈 Résultats par équipe :\n`;
    teamStats.forEach(stat => {
      explanation += `\n• ${stat.name} : ${stat.count} joueur(s)\n`;
      explanation += `  - Score total : ${stat.totalScore}\n`;
      explanation += `  - Motivation moyenne : ${stat.avgMotivation}/4\n`;
      explanation += `  - Disponibilité moyenne : ${stat.avgDisponibilite}/4\n`;
    });

    // Calcul de l'écart-type pour montrer l'équilibrage
    const avgScores = teamStats.map(t => parseFloat(t.totalScore));
    const mean = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
    const variance = avgScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / avgScores.length;
    const stdDev = Math.sqrt(variance);

    explanation += `\n\n✅ Équilibrage : Écart-type = ${stdDev.toFixed(2)} `;
    explanation += `(plus le chiffre est proche de 0, plus les équipes sont équilibrées)`;

    return explanation;
  }
}
