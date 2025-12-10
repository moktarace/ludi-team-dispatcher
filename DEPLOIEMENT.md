# 🌐 Déploiement en ligne

L'application est déployée automatiquement sur GitHub Pages :

**URL** : https://moktarace.github.io/ludi-team-dispatcher/

Chaque commit sur la branche `main` déclenche un nouveau déploiement automatique via GitHub Actions.

---

## 📊 Statut du déploiement

Pour voir l'état du déploiement :
1. Allez sur https://github.com/moktarace/ludi-team-dispatcher/actions
2. Consultez le workflow "Deploy to GitHub Pages"

## 🔄 Workflow de déploiement

Le déploiement est géré par `.github/workflows/deploy.yml` :
- Déclenché à chaque push sur `main`
- Build Angular avec la bonne base URL
- Déploiement automatique sur GitHub Pages
