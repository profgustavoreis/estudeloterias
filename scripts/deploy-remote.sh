#!/usr/bin/env bash
# =============================================================================
# deploy-remote.sh — Roda o deploy-cloudpanel.sh no servidor de produção
# a partir da sua máquina local (notebook ou desktop).
#
#   Uso:  bash scripts/deploy-remote.sh
#   Env:  DEPLOY_SSH_KEY  (default: chave do notebook no Google Drive)
#         DEPLOY_SSH_HOST (default: ubuntu@157.151.10.2)
#         DEPLOY_SSH_PORT (default: 22)
#
# O que faz:
#   1. SSH como ubuntu no servidor CloudPanel
#   2. Troca para o usuário estudeloterias (dono dos arquivos/nvm/PM2)
#   3. Executa scripts/deploy-cloudpanel.sh em produção
#
# Pré-requisito: a chave SSH precisa estar no caminho indicado (ou exporte
# DEPLOY_SSH_KEY com o caminho da sua máquina, ex. no desktop).
# =============================================================================
set -euo pipefail

DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/Library/CloudStorage/GoogleDrive-gustavo@gustavoreis.com/My Drive/_file-sharing/cloud-migration/professorgustavoreis-vm/_ssh-keys/professorgustavoreis-vm-2023-07-26.key}"
DEPLOY_SSH_HOST="${DEPLOY_SSH_HOST:-ubuntu@157.151.10.2}"
DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"

[ -f "$DEPLOY_SSH_KEY" ] || { echo "ERRO: chave não encontrada: $DEPLOY_SSH_KEY (exporte DEPLOY_SSH_KEY)" >&2; exit 1; }

ssh -i "$DEPLOY_SSH_KEY" -p "$DEPLOY_SSH_PORT" "$DEPLOY_SSH_HOST" \
  'sudo -u estudeloterias bash -lc "export NVM_DIR=/home/estudeloterias/.nvm; . \$NVM_DIR/nvm.sh >/dev/null; nvm use 24.18.0 >/dev/null; bash ~/htdocs/estudeloterias.com.br/scripts/deploy-cloudpanel.sh"'
