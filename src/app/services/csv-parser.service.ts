import { Injectable } from '@angular/core';
import { Player, Motivation, Disponibilite } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  parseFile(fileContent: string): Player[] {
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    // Trouver l'index de la ligne d'en-tête (celle qui contient "Nom" et "Prénom")
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Nom') && lines[i].includes('Prénom')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      throw new Error('Fichier invalide : en-tête non trouvé');
    }

    // Parser l'en-tête pour trouver les index des colonnes
    const headers = this.parseLine(lines[headerIndex]);
    const nomIndex = this.findExactColumnIndex(headers, 'Nom');
    const prenomIndex = this.findExactColumnIndex(headers, 'Prénom');
    const motivationIndex = this.findColumnIndex(headers, 'Envie de jouer');
    const disponibiliteIndex = this.findColumnIndex(headers, 'Disponibilité');
    const commentaireIndex = this.findColumnIndex(headers, 'Commentaires');

    // Parser les données
    const players: Player[] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const columns = this.parseLine(lines[i]);
      
      if (columns.length < Math.max(nomIndex, prenomIndex, motivationIndex, disponibiliteIndex) + 1) {
        continue; // Ligne incomplète
      }

      const nom = columns[nomIndex]?.trim();
      const prenom = columns[prenomIndex]?.trim();
      const motivationText = columns[motivationIndex]?.trim();
      const disponibiliteText = columns[disponibiliteIndex]?.trim();
      const commentaire = commentaireIndex !== -1 ? columns[commentaireIndex]?.trim() : '';

      if (!nom || !prenom) {
        continue; // Données manquantes
      }

      const motivation = this.parseMotivation(motivationText);
      const disponibilite = this.parseDisponibilite(disponibiliteText);
      const score = motivation + disponibilite;

      players.push({
        nom,
        prenom,
        motivation,
        disponibilite,
        commentaire,
        score
      });
    }

    // Supprimer les doublons (même nom et prénom, insensible à la casse)
    // Ne garder que la dernière entrée
    return this.removeDuplicates(players);
  }

  private removeDuplicates(players: Player[]): Player[] {
    const uniquePlayers = new Map<string, Player>();
    
    // Parcourir les joueurs et stocker chaque joueur avec une clé unique
    // Le Map écrasera automatiquement les anciennes entrées, gardant la dernière
    for (const player of players) {
      const key = `${player.nom.toLowerCase()}-${player.prenom.toLowerCase()}`;
      uniquePlayers.set(key, player);
    }
    
    return Array.from(uniquePlayers.values());
  }

  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === '\t' && !inQuotes) {
        result.push(current.replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.replace(/^"|"$/g, ''));
    return result;
  }

  private findColumnIndex(headers: string[], searchTerm: string): number {
    return headers.findIndex(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  private findExactColumnIndex(headers: string[], searchTerm: string): number {
    // Cherche une correspondance exacte (en ignorant la casse et les espaces)
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return headers.findIndex(h => h.toLowerCase().trim() === normalizedSearch);
  }

  private parseMotivation(text: string): Motivation {
    if (!text) return Motivation.NE_SAIS_PAS;
    
    if (text.includes('super envie') || text.includes('🔥')) {
      return Motivation.SUPER_ENVIE;
    } else if (text.includes('ça me tente') || text.includes('🙂')) {
      return Motivation.CA_ME_TENTE;
    } else if (text.includes('ne sais pas') || text.includes('🤔')) {
      return Motivation.NE_SAIS_PAS;
    } else if (text.includes('pas pour le moment') || text.includes('❄️')) {
      return Motivation.PAS_POUR_MOMENT;
    }
    
    return Motivation.NE_SAIS_PAS;
  }

  private parseDisponibilite(text: string): Disponibilite {
    if (!text) return Disponibilite.DE_TEMPS_EN_TEMPS;
    
    if (text.includes('chaque fois') || text.includes('✅')) {
      return Disponibilite.CHAQUE_FOIS;
    } else if (text.includes('arranger') || text.includes('🔄')) {
      return Disponibilite.PEUX_ARRANGER;
    } else if (text.includes('temps en temps') || text.includes('📅')) {
      return Disponibilite.DE_TEMPS_EN_TEMPS;
    }
    
    return Disponibilite.DE_TEMPS_EN_TEMPS;
  }
}
