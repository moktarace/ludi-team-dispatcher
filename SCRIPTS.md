# Scripts utiles pour le projet

## 🚀 Démarrage rapide

```powershell
# Installation
npm install

# Lancer l'application
npm start
```

## 🧹 Nettoyage

```powershell
# Nettoyer les fichiers de build
Remove-Item -Recurse -Force dist, .angular/cache -ErrorAction SilentlyContinue

# Nettoyer et réinstaller
Remove-Item -Recurse -Force node_modules
npm install
```

## 📦 Build

```powershell
# Build de développement
npm run build

# Build de production
npm run build -- --configuration production

# Build avec analyse de bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/ludi-team-dispatcher/stats.json
```

## 🧪 Tests

```powershell
# Lancer les tests unitaires (à configurer)
npm test

# Tests avec coverage
npm test -- --code-coverage
```

## 🔍 Linting

```powershell
# Installer ESLint (optionnel)
npm install --save-dev @angular-eslint/builder @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/schematics @angular-eslint/template-parser @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint

# Lancer le linting
ng lint
```

## 📊 Analyse

```powershell
# Voir la taille des bundles
npm run build -- --stats-json
```

## 🌐 Serveur de production local

```powershell
# Installer http-server
npm install -g http-server

# Build et servir
npm run build
cd dist/ludi-team-dispatcher
http-server -p 8080
```

## 🔄 Update des dépendances

```powershell
# Vérifier les packages obsolètes
npm outdated

# Mettre à jour Angular
ng update @angular/core @angular/cli

# Mettre à jour tous les packages
npm update
```

## 🐛 Debugging

```powershell
# Servir avec source maps détaillées
ng serve --source-map

# Servir en mode production
ng serve --configuration production

# Servir sur un port différent
ng serve --port 4300

# Ouvrir automatiquement le navigateur
ng serve --open
```

## 📱 Test mobile local

```powershell
# Servir sur le réseau local
ng serve --host 0.0.0.0

# Puis accéder depuis mobile via : http://<votre-ip>:4200
```

## 🎨 Génération de composants

```powershell
# Générer un nouveau composant
ng generate component nom-composant

# Générer un service
ng generate service nom-service

# Générer un module
ng generate module nom-module
```

## 📦 Déploiement

### GitHub Pages

```powershell
# Installer
npm install -g angular-cli-ghpages

# Build
ng build --base-href "/ludi-selection-improvisem/"

# Deploy
npx angular-cli-ghpages --dir=dist/ludi-team-dispatcher
```

### Netlify

```powershell
# Installer Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --dir=dist/ludi-team-dispatcher --prod
```

### Firebase

```powershell
# Installer Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init
firebase init

# Deploy
firebase deploy
```

## 🔐 Environnements

```powershell
# Servir avec environnement de prod
ng serve --configuration production

# Build pour staging
ng build --configuration staging
```

## 💾 Backup

```powershell
# Créer un backup du projet (sans node_modules)
$date = Get-Date -Format "yyyy-MM-dd"
Compress-Archive -Path . -DestinationPath "../ludi-backup-$date.zip" -Force -CompressionLevel Optimal
```
