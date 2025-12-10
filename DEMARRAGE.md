# ⚡ DÉMARRAGE ULTRA-RAPIDE

## 🎯 En 3 étapes (2 minutes)

### 1️⃣ Lancer l'application
```powershell
npm start
```

### 2️⃣ Ouvrir le navigateur
Aller sur : **http://localhost:4200**

### 3️⃣ Tester
Glisser-déposer le fichier **exemple.tsv** sur la zone de dépôt

**C'est tout ! 🎉**

---

## 📋 Checklist de démarrage

- [ ] J'ai Node.js installé (version 18+)
- [ ] J'ai ouvert un terminal PowerShell
- [ ] Je suis dans le dossier du projet
- [ ] J'ai lancé `npm start`
- [ ] J'ai attendu que le serveur démarre (message "Compiled successfully")
- [ ] J'ai ouvert http://localhost:4200 dans Chrome/Firefox/Edge
- [ ] J'ai glissé-déposé exemple.tsv
- [ ] Je vois les 4 équipes affichées

---

## ❓ Problèmes ?

### Le serveur ne démarre pas
```powershell
# Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Port 4200 déjà utilisé
```powershell
# Utiliser un autre port
ng serve --port 4300
```

### Le fichier n'est pas reconnu
- Vérifier que c'est bien exemple.tsv (pas exemple.xlsx)
- Le fichier doit être au format TSV (séparé par tabulations)

---

## 📚 Besoin de plus d'infos ?

| Question | Document à lire |
|----------|----------------|
| Comment utiliser l'app ? | **GUIDE.md** |
| Comment ça marche ? | **README.md** |
| Quoi de prévu ensuite ? | **ROADMAP.md** |
| Vue d'ensemble complète | **INDEX.md** |

---

## 🎊 Tout fonctionne ?

**Prochaines étapes :**

1. ✅ Lire **GUIDE.md** pour comprendre toutes les fonctionnalités
2. 🎨 Personnaliser les couleurs si besoin (voir GUIDE.md)
3. 📊 Tester avec vos propres fichiers CSV/TSV
4. 🚀 Déployer en production (voir GUIDE.md → Déploiement)

---

**Bon dispatch ! 🎯**
