#!/usr/bin/env bash
# =============================================================================
# deploy-production.sh — Deploy de produção do Estude Loterias (Oracle Cloud
# Free + aaPanel + Apache). Rode a partir de QUALQUER diretório; o script
# localiza a raiz do repo sozinho (usa este arquivo como âncora).
#
#   Uso:  bash scripts/deploy-production.sh
#   Env:  API_PORT=3000   (porta da API em produção — default 3000)
#         GIT_SSH_KEY=~/.ssh/id_ed25519  (chave SSH do GitHub — default)
#
# O fluxo (validação + correções em relação ao runbook original):
#   1. git pull (com GIT_SSH_COMMAND explícito — o alias "gitpull" NÃO existe
#      em shell não-interativo, então embutimos a mesma linha do alias aqui)
#   2. pnpm install --frozen-lockfile  (dependências novas/mudadas)
#      a tabela articles. No dev/legacy do Replit isso ocorria via post-merge.sh,
#      mas em produção (aaPanel) ninguém roda — sem isto, /blog e /admin/blog
#      respondem 500.)
#   4. build do api-server
#   5. build do frontend (PORT + BASE_PATH são exigidos pelo vite.config.ts)
#   6. kill do processo da API na porta $API_PORT (libera para o aaPanel religar)
#   7. instrução manual: clicar em Start no aaPanel
#   8. healthcheck automático em /api/healthz
# =============================================================================
set -euo pipefail

API_PORT="${API_PORT:-3000}"
GIT_SSH_KEY="${GIT_SSH_KEY:-$HOME/.ssh/id_ed25519}"
FRONTEND_PORT="${FRONTEND_PORT:-5000}" # só satisfaz a checagem do vite.config.ts
BASE_PATH="${BASE_PATH:-/}"

# --- Localiza a raiz do repo a partir da localização deste script ------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

say()  { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31mERRO:\033[0m %s\n' "$*" >&2; exit 1; }

[ -d ".git" ] || fail "Não parece estar num repo git (raiz detectada: $REPO_ROOT)"

say "Repo: $REPO_ROOT"
say "Porta da API: $API_PORT | Chave SSH: $GIT_SSH_KEY"

# --- 1. Git pull (mesma linha do alias "gitpull", portável) -------------------
say "git pull origin main"
GIT_SSH_COMMAND="ssh -i $GIT_SSH_KEY" git pull origin main

# --- 2. Dependências ----------------------------------------------------------
say "pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

# --- 3. Schema (CRÍTICO — cria a tabela articles) ------------------------------
say "pnpm --filter db push  (aplica o schema no Postgres de produção)"
pnpm --filter db push

# --- 4. Build do backend -------------------------------------------------------
say "pnpm --filter @workspace/api-server run build"
pnpm --filter @workspace/api-server run build

# --- 5. Build do frontend (gera o dist/public que o api-server vai servir) ------
# Garantir que as vars VITE_* (ex.: VITE_ADSENSE_ENABLED) cheguem ao build.
# O vite.config.ts já leva envDir para a raiz, mas exportá-las explicitamente é
# mais à prova de regressões. (Fonte do .env da raiz; não expõe segredos aqui.)
set -a
[ -f "$REPO_ROOT/.env" ] && . "$REPO_ROOT/.env"
set +a

# Aviso de build: use exatamente "false" para DESLIGAR os anúncios/placeholders.
# O AdUnit só os desativa quando a var é exatamente "false"; qualquer outro valor
# (ou var ausente, ex.: linha comentada com #) => anúncios/placeholders ativos.
VITE_ADSENSE_ENABLED="${VITE_ADSENSE_ENABLED:-<vazio>}"
case "$VITE_ADSENSE_ENABLED" in
  false)  say "AdSense: VITE_ADSENSE_ENABLED=false -> anúncios/placeholders DESATIVADOS no build." ;;
  true)   printf '\n\033[1;33m==>\033[0m AVISO: anúncios HABILITADOS no build (VITE_ADSENSE_ENABLED=true). Confira o publisher ID se for intencional.\n' ;;
  *)      printf '\n\033[1;33m==>\033[0m AVISO: VITE_ADSENSE_ENABLED nao definido ou valor inesperado (atual: "%s").\n' "$VITE_ADSENSE_ENABLED" >&2
          printf '  Anúncios/placeholders serão HABILITADOS. Se a intenção é desativar, defina VITE_ADSENSE_ENABLED=false (linha SEM #) no .env.\n' >&2 ;;
esac
say "pnpm --filter @workspace/estude-loterias run build (BASE_PATH=$BASE_PATH)"
PORT="$FRONTEND_PORT" BASE_PATH="$BASE_PATH" \
  pnpm --filter @workspace/estude-loterias run build

# --- 5b. FRONTEND_DIST — obrigatório: aponta o api-server para o build do SPA ----
# (Sem isto o api-server não serve o HTML e o head SEO de /blog/* não é injetado.)
FRONTEND_DIST="$REPO_ROOT/artifacts/estude-loterias/dist/public"
if grep -q '^FRONTEND_DIST=' "$REPO_ROOT/.env" 2>/dev/null; then
  sed -i.bak "s|^FRONTEND_DIST=.*|FRONTEND_DIST=$FRONTEND_DIST|" "$REPO_ROOT/.env" && rm -f "$REPO_ROOT/.env.bak"
else
  printf 'FRONTEND_DIST=%s\n' "$FRONTEND_DIST" >> "$REPO_ROOT/.env"
fi
say "FRONTEND_DIST setado no .env -> $FRONTEND_DIST"

# --- 6. Encerra o processo da API na porta -------------------------------------
say "Liberando a porta $API_PORT (fuser -k)"
if fuser -k "${API_PORT}/tcp" >/dev/null 2>&1; then
  say "Processo da API na porta $API_PORT encerrado."
else
  say "Nenhum processo encontrado na porta $API_PORT (ou fuser indisponível)."
fi

cat <<'EOF'

───────────────────────────────────────────────────────────────────────
  PRÓXIMO PASSO MANUAL no painel aaPanel:
    1. Abra a aba "Node Projects" (ou "Node.js projects").
    2. Localize o projeto do Estude Loterias (o que roda a API).
    3. Clique em [ Start ] para religar o backend com o build novo.
    4. Volte aqui — este script vai aguardar você e testar a API.
───────────────────────────────────────────────────────────────────────
EOF

read -r -p "Pressione ENTER depois de clicar em Start no aaPanel..." _

# --- 7. Healthcheck ------------------------------------------------------------
say "Aguardando a API responder em http://127.0.0.1:${API_PORT}/api/healthz ..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${API_PORT}/api/healthz" >/dev/null 2>&1; then
    say "API no ar! Healthcheck OK."
    say "Valide em seguida: curl -s http://127.0.0.1:${API_PORT}/blog/posts"
    exit 0
  fi
  sleep 2
done

fail "API não respondeu em ~60s. Verifique se você clicou em Start no aaPanel e confira os logs do Node project."
