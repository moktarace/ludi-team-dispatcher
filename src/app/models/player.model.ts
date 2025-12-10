export enum Motivation {
  SUPER_ENVIE = 4,      // 🔥 Oui, j'ai super envie !
  CA_ME_TENTE = 3,      // 🙂 Oui, ça me tente bien
  NE_SAIS_PAS = 2,      // 🤔 Je ne sais pas encore
  PAS_POUR_MOMENT = 1   // ❄️ Non, pas pour le moment
}

export enum Disponibilite {
  CHAQUE_FOIS = 4,        // ✅ Disponible à chaque fois
  PEUX_ARRANGER = 3,      // 🔄 Je peux m'arranger si besoin
  DE_TEMPS_EN_TEMPS = 2,  // 📅 Disponible de temps en temps
  INDISPONIBLE = 1        // Indisponible
}

export interface Player {
  nom: string;
  prenom: string;
  motivation: Motivation;
  disponibilite: Disponibilite;
  commentaire?: string;
  score: number; // Score calculé pour le dispatch
}

export interface Team {
  name: string;
  color: string;
  players: Player[];
  totalScore: number;
  avgMotivation: number;
  avgDisponibilite: number;
}

export interface DispatchResult {
  teams: Team[];
  explanation: string;
}

export interface PlayerSwapSuggestion {
  player: Player;
  scoreDifference: number;
  newTeamScore: number;
  targetTeamScore: number;
}
