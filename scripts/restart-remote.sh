#!/usr/bin/env bash
# =============================================================================
# restart-remote.sh — Reinicia a aplicação Node.js (PM2) no servidor CloudPanel
# a partir da sua máquina local, recarregando variáveis do .env.
#
#   Uso:  bash scripts/restart-remote.sh
#   Env:  DEPLOY_SSH_KEY  (default: chave do notebook no Google Drive)
#         DEPLOY_SSH_HOST (default: ubuntu@157.151.10.2)
#         DEPLOY_SSH_PORT (default: 22)
#         PM2_NAME        (default: estudeloterias)
#         API_PORT        (default: 3002)
# =============================================================================
set -euo pipefail

DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/Library/CloudStorage/GoogleDrive-gustavo@gustavoreis.com/My Drive/_file-sharing/cloud-migration/professorgustavoreis-vm/_ssh-keys/professorgustavoreis-vm-2023-07-26.key}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-ubuntu@157.151.10.2}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
PM2_NAME="${PM2_NAME:-estudeloterias}"
API_PORT="${API_PORT:-3002}"

say()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31mERRO:\033[0m %s\n' "$*" >&2; exit 1; }

[ -f "$DEPLOY_SSH_KEY" ] || fail "Chave SSH não encontrada: $DEPLOY_SSH_KEY (exporte DEPLOY_SSH_KEY)"

say "Reiniciando PM2 ($PM2_NAME) em $DEPLOY_SSH_HOST..."

ssh -i "$DEPLOY_SSH_KEY" -p "$DEPLOY_SSH_PORT" "$DEPLOY_SSH_HOST" "sudo -u estudeloterias bash -lc '
  export NVM_DIR=/home/estudeloterias/.nvm
  [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" >/dev/null
  nvm use 24.18.0 >/dev/null 2>&1 || true

  echo \"==> pm2 restart $PM2_NAME --update-env\"
  pm2 restart \"$PM2_NAME\" --update-env

  echo \"==> Verificando API na porta $API_PORT...\"
  for i in \$(seq 1 15); do
    if curl -fsS \"http://127.0.0.1:${API_PORT}/api/healthz\" >/dev/null 2>&1; then
      echo \"==> API no ar! Healthcheck OK.\"
      exit 0
    fi
    sleep 1
  done

  echo \"ERRO: API não respondeu na porta $API_PORT após restart.\" >&2
  pm2 logs \"$PM2_NAME\" --lines 10 --nostream >&2
  exit 1
'"

say "Aplicação reiniciada com sucesso e pronta para uso!"
