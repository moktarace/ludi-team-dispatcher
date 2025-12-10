# 🎯 Guide d'utilisation - LUDI Team Dispatcher

## ✅ Installation réussie !

Votre projet Angular est maintenant prêt et fonctionne sur **http://localhost:4200**

## 📖 Comment utiliser l'application

### 1️⃣ Démarrer l'application

```bash
npm start
```

L'application sera accessible à l'adresse : http://localhost:4200

### 2️⃣ Uploader un fichier

Vous avez deux options :

**Option A : Drag & Drop (Recommandé)**
- Glissez simplement votre fichier CSV/TSV depuis votre explorateur
- Déposez-le sur la zone de dépôt de l'application

**Option B : Sélection de fichier**
- Cliquez sur le bouton "Parcourir les fichiers"
- Sélectionnez votre fichier CSV/TSV

### 3️⃣ Voir les résultats

Une fois le fichier uploadé :
- Les 4 équipes s'affichent automatiquement (Noirs, Jaune, Rouge, Blanc)
- Chaque équipe montre :
  - Le nombre de joueurs
  - Le score total de l'équipe
  - La motivation moyenne
  - La disponibilité moyenne
  - La liste détaillée des joueurs

### 4️⃣ Comprendre le dispatch

Cliquez sur le bouton **"▶ Explication du dispatch"** pour voir :
- La méthode utilisée (Snake Draft)
- Les statistiques détaillées par équipe
- L'écart-type montrant l'équilibre des équipes

### 5️⃣ Refaire un dispatch

Pour dispatcher un nouveau fichier :
- Uploadez simplement un nouveau fichier
- Les équipes seront automatiquement recalculées

## 📊 Format du fichier

Votre fichier doit contenir ces colonnes (dans n'importe quel ordre) :

| Colonne | Description | Valeurs possibles |
|---------|-------------|-------------------|
| **Nom** | Nom de famille | Texte libre |
| **Prénom** | Prénom | Texte libre |
| **Envie de jouer** | Motivation | 🔥 Super envie (4)<br>🙂 Ça me tente (3)<br>🤔 Ne sais pas (2)<br>❄️ Pas pour le moment (1) |
| **Disponibilité** | Disponibilité le mardi | ✅ Chaque fois (4)<br>🔄 Peut s'arranger (3)<br>📅 De temps en temps (2) |
| **Commentaires** | Optionnel | Texte libre |

## 🔍 Exemple de fichier

Le fichier `exemple.tsv` est fourni comme référence. Vous pouvez l'utiliser pour tester l'application.

## 🎨 Personnalisation

### Couleurs des équipes

Les couleurs sont définies dans `src/app/services/team-dispatcher.service.ts` :

```typescript
private readonly TEAM_CONFIGS = [
  { name: 'Noirs', color: '#1a1a1a' },
  { name: 'Jaune', color: '#ffd700' },
  { name: 'Rouge', color: '#dc3545' },
  { name: 'Blanc', color: '#f8f9fa' }
];
```

### Nombre d'équipes

Pour modifier le nombre d'équipes, ajoutez ou supprimez des entrées dans `TEAM_CONFIGS`.

### Algorithme de dispatch

L'algorithme Snake Draft se trouve dans `src/app/services/team-dispatcher.service.ts`.
Vous pouvez le modifier pour implémenter une autre stratégie de distribution.

## 🧪 Tests avec le fichier exemple

1. Lancez l'application : `npm start`
2. Ouvrez http://localhost:4200
3. Glissez-déposez le fichier `exemple.tsv`
4. Observez la distribution des 32 joueurs en 4 équipes équilibrées

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers compilés seront dans `dist/ludi-team-dispatcher/`.

### Déployer sur un serveur web

Copiez le contenu du dossier `dist/ludi-team-dispatcher/` sur votre serveur web.

### Déployer sur GitHub Pages (gratuit)

1. Installer le package de déploiement :
```bash
npm install -g angular-cli-ghpages
```

2. Build avec la bonne base URL :
```bash
ng build --base-href "https://<votre-username>.github.io/<nom-du-repo>/"
```

3. Déployer :
```bash
npx angular-cli-ghpages --dir=dist/ludi-team-dispatcher
```

## 📱 Compatibilité

- ✅ Chrome (recommandé)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Mobile (iOS/Android)

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
npm start
```

### Le fichier n'est pas reconnu
- Vérifiez que le fichier a l'extension `.csv` ou `.tsv`
- Assurez-vous que les colonnes requises sont présentes
- Ouvrez le fichier dans un éditeur de texte pour vérifier le format

### Les équipes sont vides
- Vérifiez que les données sont sur les lignes après l'en-tête
- Assurez-vous que les colonnes Nom et Prénom ne sont pas vides

## 📞 Support

Pour toute question ou problème, vérifiez :
1. Les messages d'erreur affichés dans l'application
2. La console du navigateur (F12)
3. Le terminal où l'application est lancée

## 🎉 Fonctionnalités avancées

### Exporter les équipes

Pour ajouter une fonction d'export des équipes :
- En PDF
- En CSV
- En image

Cette fonctionnalité peut être ajoutée dans une prochaine version.

### Contraintes supplémentaires

Pour ajouter des contraintes (ex: ne pas mettre 2 joueurs ensemble) :
- Modifier le service `team-dispatcher.service.ts`
- Ajouter une logique de validation après le dispatch

### Historique des dispatches

Pour sauvegarder l'historique :
- Utiliser le localStorage du navigateur
- Ou connecter à une base de données backend

---

**Bon dispatch ! 🎯**
