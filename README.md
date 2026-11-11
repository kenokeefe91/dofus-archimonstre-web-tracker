# Dofus — Tracker d'archimonstres (version web)

Page web autonome pour suivre les archimonstres capturés sur Dofus. Les données de départ viennent de la base SQLite du projet Godot (`archimonstre.db.sqlite`) et sont exportées dans `archimonstre.json` ; l'état de tes captures est stocké dans le `localStorage` du navigateur (clé `archimonstre_tracker_v1`).

Repo : https://github.com/kenokeefe91/dofus-archimonstre-web-tracker
Page en ligne (GitHub Pages) : https://kenokeefe91.github.io/dofus-archimonstre-web-tracker/

## Lancer la page

En ligne : https://kenokeefe91.github.io/dofus-archimonstre-web-tracker/ (rien à installer).

En local : les données sont chargées via `fetch('archimonstre.json')`, donc ouvrir `index.html` directement en `file://` est bloqué par le navigateur. Il faut servir le dossier en local :

```bash
cd archimonstre-gpage-tracker
python3 -m http.server
```

puis ouvrir http://localhost:8000 dans un navigateur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | structure de la page |
| `style.css` | styles |
| `app.js` | logique : filtres, tri, rendu, persistance localStorage |
| `archimonstre.json` | données exportées de la SQLite (284 archimonstres, 111 zones, 4 pierres d'âme) |
| `archimonstre.db.sqlite` | base SQLite d'origine (projet Godot) |
| `liste_monstre.csv` | export CSV d'origine |

## Fonctionnalités

- Liste des 284 archimonstres : monstre, niveaux min/max, étapes, pierre d'âme, zones
- Case « capturé » par archimonstre, sauvegardée automatiquement dans le localStorage
- Aucune capture cochée par défaut (le bouton « Réinitialiser » remet tout à zéro)
- Recherche texte (archimonstre ou monstre)
- Filtres par zone, par pierre d'âme, par statut (tous / capturés / non capturés)
- Case « Cacher les capturés » pour ne voir que ce qu'il reste à faire
- Tri par nom, niveau max ou pierre d'âme
- Compteur et barre de progression (x / 284)
- Lien vers le repo GitHub dans l'en-tête

## Régénérer `archimonstre.json` depuis la base SQLite

```bash
python3 - <<'EOF'
import sqlite3, json
con = sqlite3.connect('archimonstre.db.sqlite')
con.row_factory = sqlite3.Row
cur = con.cursor()
archis = [dict(r) for r in cur.execute(
    'SELECT a.*, p.nom AS pierre_dame FROM archimonstre a JOIN pierre_dame p ON p.id = a.pierre_dame_id ORDER BY a.nom')]
zones_ids = {}
for aid, zid in cur.execute('SELECT archimonstre_id, zone_id FROM archimonstre_zone'):
    zones_ids.setdefault(aid, []).append(zid)
for a in archis:
    a['zones_ids'] = zones_ids.get(a['id'], [])
    a['capture'] = bool(a['capture'])
zones = [dict(r) for r in cur.execute('SELECT id, nom, travel FROM zone_de_monstre ORDER BY nom')]
pierres = [dict(r) for r in cur.execute('SELECT id, nom, lvl_max FROM pierre_dame ORDER BY id')]
json.dump({'archimonstres': archis, 'zones': zones, 'pierres': pierres},
          open('archimonstre.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
EOF
```
