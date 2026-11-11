# Dofus — Tracker d'archimonstres (version web)

Page web autonome pour suivre les archimonstres capturés sur Dofus. Les données (284 archimonstres, 111 zones, 4 pierres d'âme) sont embarquées dans `archimonstre.json` ; l'état de tes captures est stocké dans le `localStorage` du navigateur (clé `archimonstre_tracker_v1`).

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
| `archimonstre.json` | données : 284 archimonstres, 111 zones, 4 pierres d'âme |

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

## Modifier les données

Éditer directement `archimonstre.json` (structure : `archimonstres` avec `id`, `nom`, `monstre`, `etapes`, `lvl_min`, `lvl_max`, `pierre_dame_id`, `pierre_dame`, `zones_ids` ; plus les tableaux `zones` et `pierres`), puis recharger la page.
