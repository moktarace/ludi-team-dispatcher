# LUDI Team Dispatcher 🎯

Application Angular pour la distribution automatique et équilibrée des joueurs en 4 équipes (Noirs, Jaune, Rouge, Blanc).

## 🎨 Fonctionnalités

- **Drag & Drop** : Glissez-déposez votre fichier CSV/TSV directement dans l'interface
- **Distribution équilibrée** : Algorithme Snake Draft pour garantir l'équité entre les équipes
- **Calcul intelligent** : Prise en compte de la motivation et de la disponibilité
- **Explication détaillée** : Affichage transparent du processus de distribution
- **Interface responsive** : Fonctionne sur desktop, tablette et mobile

## 📋 Format du fichier attendu

Le fichier CSV ou TSV doit contenir les colonnes suivantes :
- **Nom** : Nom de famille du joueur
- **Prénom** : Prénom du joueur
- **Envie de jouer avec une équipe ?** : Niveau de motivation
  - 🔥 Oui, j'ai super envie ! (score: 4)
  - 🙂 Oui, ça me tente bien (score: 3)
  - 🤔 Je ne sais pas encore (score: 2)
  - ❄️ Non, pas pour le moment (score: 1)
- **Disponibilité le mardi soir (à la Turbine)** : Niveau de disponibilité
  - ✅ Disponible à chaque fois (score: 4)
  - 🔄 Je peux m'arranger si besoin (score: 3)
  - 📅 Disponible de temps en temps (score: 2)
- **Commentaires ou questions** : Commentaires optionnels

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm (inclus avec Node.js)

### Étapes d'installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer l'application en mode développement :
```bash
npm start
```

3. Ouvrir votre navigateur à l'adresse : `http://localhost:4200`

## 🔧 Compilation pour production

Pour créer une version optimisée pour la production :
```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/ludi-team-dispatcher/`.

## 📊 Algorithme de distribution

L'application utilise un algorithme **Snake Draft** :

1. Les joueurs sont triés par score décroissant (motivation + disponibilité)
2. Distribution en serpentin :
   - Tour 1 : Équipe 1 → 2 → 3 → 4
   - Tour 2 : Équipe 4 → 3 → 2 → 1
   - Tour 3 : Équipe 1 → 2 → 3 → 4
   - Et ainsi de suite...

Cette méthode garantit que chaque équipe reçoit un mélange équilibré de joueurs très motivés et moins disponibles.

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── models/
│   │   └── player.model.ts          # Interfaces et enums
│   ├── services/
│   │   ├── csv-parser.service.ts    # Parser CSV/TSV
│   │   └── team-dispatcher.service.ts # Algorithme de dispatch
│   ├── app.component.ts              # Composant principal
│   ├── app.component.html            # Template HTML
│   └── app.component.css             # Styles
├── main.ts                           # Point d'entrée
├── index.html                        # Page HTML principale
└── styles.css                        # Styles globaux
```

## 🎯 Utilisation

1. Lancez l'application
2. Glissez-déposez votre fichier CSV/TSV ou cliquez sur "Parcourir les fichiers"
3. L'application analyse automatiquement le fichier et crée les 4 équipes
4. Cliquez sur "▶ Explication du dispatch" pour voir les détails du calcul
5. Pour refaire un dispatch avec un nouveau fichier, uploadez simplement un nouveau fichier

## 📝 Exemple de fichier

Un fichier d'exemple `exemple.tsv` est fourni dans le dossier racine du projet.

## 🐛 Résolution de problèmes

### Le fichier n'est pas reconnu
- Vérifiez que votre fichier a l'extension `.csv` ou `.tsv`
- Assurez-vous que les colonnes requises sont présentes dans l'en-tête

### Les équipes semblent déséquilibrées
- Consultez l'explication du dispatch pour voir l'écart-type
- Plus il y a de joueurs, meilleur sera l'équilibrage

## 📄 Licence

Ce projet est développé pour la LUDI (Lyon Universitaire d'Improvisation).

## 👥 Équipes

- **Noirs** : #1a1a1a
- **Jaune** : #ffd700
- **Rouge** : #dc3545
- **Blanc** : #f8f9fa
