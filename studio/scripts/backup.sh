#!/bin/sh
# Sauvegarde complète du contenu Sanity (documents et fichiers) dans une archive datée.
# Usage : sh scripts/backup.sh [dossier]     (par défaut : ../../unisons-sanity-backups)
# Il faut être connecté à Sanity (npx sanity login) ou avoir SANITY_AUTH_TOKEN dans l'environnement.
# Les archives contiennent des données personnelles (équipe, e-mails) : ne jamais les mettre dans git.
cd "$(dirname "$0")/.." || exit 1
DEST="${1:-../../unisons-sanity-backups}"
mkdir -p "$DEST" || exit 1
FICHIER="$DEST/unisons-$(date +%Y-%m-%d-%H%M).tar.gz"
npx sanity dataset export production "$FICHIER" --overwrite && echo "Sauvegarde : $FICHIER"
# Garde les 12 dernières sauvegardes
ls -1t "$DEST"/unisons-*.tar.gz 2>/dev/null | tail -n +13 | while read -r vieux; do rm -f "$vieux"; done
