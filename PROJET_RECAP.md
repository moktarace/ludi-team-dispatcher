# 🎉 LUDI Team Dispatcher - Projet créé avec succès !

## ✅ Ce qui a été créé

### 📁 Structure du projet
```
ludi-selection-improvisem/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── player.model.ts          # Modèles de données
│   │   ├── services/
│   │   │   ├── csv-parser.service.ts    # Service de parsing CSV/TSV
│   │   │   └── team-dispatcher.service.ts # Algorithme Snake Draft
│   │   ├── app.component.ts             # Composant principal
│   │   ├── app.component.html           # Template HTML
│   │   └── app.component.css            # Styles du composant
│   ├── environments/                     # Configuration environnements
│   ├── main.ts                          # Bootstrap Angular
│   ├── index.html                       # Page HTML principale
│   └── styles.css                       # Styles globaux
├── angular.json                         # Configuration Angular
├── package.json                         # Dépendances npm
├── tsconfig.json                        # Configuration TypeScript
├── README.md                            # Documentation principale
├── GUIDE.md                             # Guide d'utilisation détaillé
├── ROADMAP.md                           # Améliorations futures
├── TESTS.md                             # Plan de tests manuels
├── SCRIPTS.md                           # Scripts PowerShell utiles
└── exemple.tsv                          # Fichier de test avec 32 joueurs
```

## 🎯 Fonctionnalités implémentées

### ✅ Core Features
- [x] Upload de fichiers CSV/TSV par drag & drop
- [x] Upload de fichiers CSV/TSV par sélection
- [x] Parsing intelligent des fichiers avec détection des colonnes
- [x] Support des emojis pour motivation et disponibilité
- [x] Algorithme Snake Draft pour distribution équilibrée
- [x] Affichage de 4 équipes (Noirs, Jaune, Rouge, Blanc)
- [x] Calcul des scores et statistiques par équipe
- [x] Explication détaillée du dispatch avec dropdown
- [x] Interface responsive (desktop, tablette, mobile)
- [x] Gestion des erreurs avec messages clairs

### 📊 Statistiques affichées
- Nombre de joueurs par équipe
- Score total de l'équipe
- Motivation moyenne (/4)
- Disponibilité moyenne (/4)
- Écart-type pour mesurer l'équilibrage

### 🎨 Design
- Interface moderne avec gradient violet
- Cards colorées pour chaque équipe
- Animations au hover
- Zone de drag & drop visuelle
- Responsive design avec grid CSS

## 🚀 Comment démarrer

### Installation (déjà fait)
```powershell
npm install
```

### Lancer l'application
```powershell
npm start
```

L'application sera disponible sur : **http://localhost:4200**

### Tester avec le fichier exemple
1. L'application est lancée sur http://localhost:4200
2. Glissez-déposez `exemple.tsv` sur la zone de dépôt
3. Observez les 32 joueurs répartis en 4 équipes équilibrées

## 📊 Algorithme Snake Draft

L'algorithme distribue les joueurs de façon équitable :

1. **Calcul du score** : Pour chaque joueur, score = motivation (1-4) + disponibilité (1-4)
   - Score minimum : 2 (pas motivé + indisponible)
   - Score maximum : 8 (super motivé + toujours disponible)

2. **Tri décroissant** : Les joueurs sont triés du plus motivé/disponible au moins motivé/disponible

3. **Distribution en serpentin** :
   - Tour 1 : Équipe 1 → 2 → 3 → 4 (les 4 meilleurs joueurs)
   - Tour 2 : Équipe 4 → 3 → 2 → 1 (les 4 suivants)
   - Tour 3 : Équipe 1 → 2 → 3 → 4 (les 4 suivants)
   - Tour 4 : Équipe 4 → 3 → 2 → 1 (les 4 suivants)
   - Et ainsi de suite...

4. **Résultat** : Chaque équipe reçoit un mélange équilibré de joueurs très motivés et moins disponibles

### Exemple avec 8 joueurs
```
Joueurs triés par score :
1. Alice (score 8)
2. Bob (score 7)
3. Charlie (score 7)
4. David (score 6)
5. Eve (score 5)
6. Frank (score 4)
7. Grace (score 4)
8. Henri (score 3)

Distribution Snake Draft :
- Équipe 1 : Alice (8) + Frank (4) = 12
- Équipe 2 : Bob (7) + Eve (5) = 12
- Équipe 3 : Charlie (7) + David (6) = 13
- Équipe 4 : David (6) + Grace (4) = 10

Écart-type faible = Bon équilibrage ✅
```

## 🎨 Personnalisation

### Changer les couleurs des équipes
Modifier `src/app/services/team-dispatcher.service.ts` :
```typescript
private readonly TEAM_CONFIGS = [
  { name: 'Noirs', color: '#1a1a1a' },    // Noir
  { name: 'Jaune', color: '#ffd700' },    // Jaune or
  { name: 'Rouge', color: '#dc3545' },    // Rouge
  { name: 'Blanc', color: '#f8f9fa' }     // Blanc cassé
];
```

### Modifier le nombre d'équipes
Ajouter ou supprimer des entrées dans `TEAM_CONFIGS`.

### Personnaliser les scores
Modifier les enums dans `src/app/models/player.model.ts` :
```typescript
export enum Motivation {
  SUPER_ENVIE = 4,      // Modifier ces valeurs
  CA_ME_TENTE = 3,
  NE_SAIS_PAS = 2,
  PAS_POUR_MOMENT = 1
}
```

## 📝 Format du fichier CSV/TSV

Le fichier doit contenir ces colonnes (ordre non important) :

| Colonne requise | Description |
|----------------|-------------|
| **Nom** | Nom de famille du joueur |
| **Prénom** | Prénom du joueur |
| **Envie de jouer** ou **Motivation** | Texte contenant : "super envie", "ça me tente", "ne sais pas", "pas pour le moment" |
| **Disponibilité** | Texte contenant : "chaque fois", "arranger", "temps en temps" |
| **Commentaires** (optionnel) | Tout texte libre |

Le parser est intelligent et cherche les colonnes par mots-clés, peu importe l'ordre ou le nom exact.

## 🐛 Résolution de problèmes

### Erreur au démarrage
```powershell
# Nettoyer et réinstaller
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Port 4200 déjà utilisé
```powershell
# Lancer sur un autre port
ng serve --port 4300
```

### Le fichier n'est pas reconnu
- Vérifier l'extension (.csv ou .tsv)
- Ouvrir le fichier dans un éditeur de texte
- Vérifier que les colonnes requises sont présentes

## 📦 Déploiement en production

### Build de production
```powershell
npm run build
```
Les fichiers seront dans `dist/ludi-team-dispatcher/`.

### Déployer gratuitement

**GitHub Pages :**
```powershell
ng build --base-href "/ludi-selection-improvisem/"
npx angular-cli-ghpages --dir=dist/ludi-team-dispatcher
```

**Netlify :**
- Glisser-déposer le dossier `dist/ludi-team-dispatcher` sur netlify.com
- Ou utiliser Netlify CLI

## 🧪 Tests suggérés

1. ✅ Upload `exemple.tsv` → Doit créer 4 équipes de ~8 joueurs
2. ✅ Cliquer sur "Explication" → Doit afficher les stats détaillées
3. ✅ Re-upload du même fichier → Doit donner le même résultat
4. ✅ Tester sur mobile → L'interface doit être responsive
5. ✅ Tester avec un fichier CSV (pas TSV) → Doit fonctionner aussi

## 📚 Documentation

- **README.md** : Vue d'ensemble du projet
- **GUIDE.md** : Guide d'utilisation complet avec exemples
- **ROADMAP.md** : Liste des améliorations futures possibles
- **TESTS.md** : Plan de tests manuels détaillé
- **SCRIPTS.md** : Scripts PowerShell pour le développement

## 🎓 Technologies utilisées

- **Angular 17** : Framework web moderne
- **TypeScript 5.2** : Langage fortement typé
- **CSS Grid & Flexbox** : Layout responsive
- **HTML5 File API** : Drag & drop de fichiers
- **RxJS** : Programmation réactive (inclus avec Angular)

## 🚀 Prochaines étapes suggérées

1. ✅ Tester l'application avec `exemple.tsv`
2. 📝 Lire le GUIDE.md pour comprendre toutes les fonctionnalités
3. 🎨 Personnaliser les couleurs si besoin
4. 📊 Tester avec vos propres fichiers CSV
5. 🌐 Déployer en production (GitHub Pages / Netlify)
6. 🔧 Implémenter les fonctionnalités de la ROADMAP

## 🤝 Contribution

Pour ajouter des fonctionnalités :
1. Consulter ROADMAP.md pour les idées
2. Créer une branche pour votre fonctionnalité
3. Tester avec TESTS.md
4. Soumettre une Pull Request

## 📞 Support

En cas de problème :
1. Vérifier les messages d'erreur dans l'application
2. Consulter la console du navigateur (F12)
3. Vérifier le terminal où `npm start` est lancé
4. Consulter la section "Résolution de problèmes" du README

## 🎉 Félicitations !

Votre application **LUDI Team Dispatcher** est prête à l'emploi !

### Testez maintenant :
```powershell
npm start
```

Puis ouvrez http://localhost:4200 et glissez-déposez `exemple.tsv` !

---

**Fait avec ❤️ pour la LUDI** 🎭
