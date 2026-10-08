#!/bin/bash
set -euo pipefail

SITE=/var/www/html/simulator
BACKUP=/var/backups/simulator
INCOMING=/home/deploy/incoming

echo "Avvio deploy..."

if [ ! -f "$INCOMING/index.html" ]; then
  echo "ERRORE: build non trovata in $INCOMING" >&2
  exit 1
fi

# Backup ultime 5 versioni
if [ -d "$SITE" ] && [ "$(ls -A $SITE)" ]; then
  TS=$(date +%Y%m%d-%H%M%S)
  cp -r "$SITE" "$BACKUP/$TS"
  ls -1dt "$BACKUP"/*/ | tail -n +6 | xargs -r rm -rf
fi

rsync -a --delete "$INCOMING"/ "$SITE"/

echo "Deploy completato."
