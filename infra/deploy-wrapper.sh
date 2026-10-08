#!/bin/bash
set -euo pipefail
case "$SSH_ORIGINAL_COMMAND" in
  "rsync --server"*)
    # consenti rsync solo verso la cartella incoming
    exec /usr/bin/rrsync /home/deploy/incoming
    ;;
  "deploy")
    exec /usr/local/bin/deploy-simulator.sh
    ;;
  *)
    echo "Comando non permesso" >&2
    exit 1
    ;;
esac
