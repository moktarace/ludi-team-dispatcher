# 🧪 Tests manuels de l'application

## Test 1 : Upload du fichier exemple.tsv

### Étapes
1. Lancer l'application : `npm start`
2. Ouvrir http://localhost:4200
3. Glisser-déposer le fichier `exemple.tsv` sur la zone de dépôt

### Résultats attendus
- ✅ Le fichier est reconnu et parsé
- ✅ 32 joueurs sont détectés
- ✅ Les 4 équipes sont créées
- ✅ Chaque équipe a environ 8 joueurs (±1)
- ✅ Les scores sont équilibrés entre les équipes

### Vérifications des données
- [ ] Les noms et prénoms sont correctement affichés
- [ ] Les emojis de motivation sont présents
- [ ] Les emojis de disponibilité sont présents
- [ ] Les commentaires des joueurs sont affichés quand présents

## Test 2 : Équilibrage des équipes

### Données du fichier exemple.tsv
Total : 32 joueurs

**Distribution de motivation attendue :**
- 🔥 Super envie : ~8 joueurs (score 4)
- 🙂 Ça me tente : ~10 joueurs (score 3)
- 🤔 Ne sais pas : ~13 joueurs (score 2)
- ❄️ Pas pour le moment : ~1 joueur (score 1)

**Distribution de disponibilité attendue :**
- ✅ Chaque fois : ~5 joueurs (score 4)
- 🔄 Peut s'arranger : ~6 joueurs (score 3)
- 📅 De temps en temps : ~21 joueurs (score 2)

### Vérifications
- [ ] Chaque équipe a au moins 1 joueur "Super envie"
- [ ] Chaque équipe a au moins 1 joueur "Chaque fois"
- [ ] L'écart-type est < 5 (bon équilibrage)
- [ ] Aucune équipe n'a tous les meilleurs joueurs

## Test 3 : Explication du dispatch

### Étapes
1. Après le dispatch, cliquer sur "▶ Explication du dispatch"

### Vérifications
- [ ] L'explication s'affiche
- [ ] Le nombre total de joueurs est correct (32)
- [ ] Les 4 équipes sont listées avec leurs stats
- [ ] L'écart-type est affiché
- [ ] La méthode "Snake Draft" est mentionnée

## Test 4 : Re-dispatch

### Étapes
1. Uploader `exemple.tsv` une première fois
2. Noter la composition des équipes
3. Uploader à nouveau `exemple.tsv`

### Vérifications
- [ ] Les équipes sont identiques (même ordre de tri)
- [ ] Aucune erreur n'apparaît
- [ ] Les statistiques sont cohérentes

## Test 5 : Fichier CSV

### Étapes
1. Convertir `exemple.tsv` en CSV (Excel → Enregistrer sous → CSV)
2. Uploader le fichier CSV

### Vérifications
- [ ] Le fichier CSV est accepté
- [ ] Les données sont correctement parsées
- [ ] Les résultats sont identiques à ceux du TSV

## Test 6 : Erreurs et edge cases

### Test 6.1 : Fichier vide
- [ ] Message d'erreur clair
- [ ] Pas de crash

### Test 6.2 : Fichier avec mauvais format
- [ ] Upload d'un fichier .txt non formaté
- [ ] Message d'erreur approprié

### Test 6.3 : Fichier avec données manquantes
- [ ] Créer un TSV sans la colonne "Nom"
- [ ] Vérifier que l'erreur est gérée

### Test 6.4 : 1 seul joueur
- [ ] Les 4 équipes sont créées
- [ ] 1 équipe a 1 joueur, les autres 0

### Test 6.5 : Nombre impair de joueurs (ex: 33)
- [ ] La distribution reste équilibrée
- [ ] Certaines équipes ont 8 joueurs, d'autres 9

## Test 7 : Responsive Design

### Desktop (1920x1080)
- [ ] Les 4 équipes sont affichées en grille 2x2
- [ ] Tous les éléments sont lisibles
- [ ] Pas de scroll horizontal

### Tablette (768x1024)
- [ ] Les équipes s'empilent en 2 colonnes
- [ ] L'interface reste utilisable
- [ ] Le drag & drop fonctionne

### Mobile (375x667)
- [ ] Les équipes sont en 1 colonne
- [ ] Le texte est lisible
- [ ] Les boutons sont assez grands pour être touchés

## Test 8 : Performance

### Gros fichier (100+ joueurs)
- [ ] Le parsing est rapide (< 1 seconde)
- [ ] Le dispatch est rapide (< 1 seconde)
- [ ] L'interface reste fluide

### Multiples uploads successifs
- [ ] Uploader 5 fichiers à la suite
- [ ] Pas de fuite mémoire
- [ ] Pas de ralentissement

## Test 9 : Compatibilité navigateur

### Chrome
- [ ] Toutes les fonctionnalités marchent
- [ ] Pas d'erreur console

### Firefox
- [ ] Toutes les fonctionnalités marchent
- [ ] Pas d'erreur console

### Edge
- [ ] Toutes les fonctionnalités marchent
- [ ] Pas d'erreur console

### Safari (si disponible)
- [ ] Toutes les fonctionnalités marchent
- [ ] Pas d'erreur console

## Test 10 : Accessibilité

### Navigation clavier
- [ ] Tab permet de naviguer
- [ ] Enter/Espace sur le bouton file input ouvre le sélecteur
- [ ] Enter/Espace sur "Explication" toggle le dropdown

### Lecteur d'écran
- [ ] Les éléments ont des labels appropriés
- [ ] Les états sont annoncés (drag over, erreur, etc.)

---

## 📊 Résultats des tests

Date : ___________  
Testeur : ___________

| Test | Statut | Commentaires |
|------|--------|--------------|
| 1. Upload exemple.tsv | ⬜ | |
| 2. Équilibrage | ⬜ | |
| 3. Explication | ⬜ | |
| 4. Re-dispatch | ⬜ | |
| 5. Fichier CSV | ⬜ | |
| 6. Erreurs | ⬜ | |
| 7. Responsive | ⬜ | |
| 8. Performance | ⬜ | |
| 9. Navigateurs | ⬜ | |
| 10. Accessibilité | ⬜ | |

**Légende :**
- ✅ = Passé
- ❌ = Échoué
- ⚠️ = Partiellement fonctionnel
- ⬜ = Non testé

---

## 🐛 Bugs trouvés

1. 
2. 
3. 

---

## 💡 Suggestions d'amélioration

1. 
2. 
3. 
