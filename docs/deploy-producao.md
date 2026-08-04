# Deploy de Produção — Estude Loterias

Guia de deploy para o ambiente de produção atual: **Oracle Cloud Free** gerenciado via **aaPanel** (Nginx + Node.js projects), mesmo servidor que hospeda outros sites.

> ⚠️ **Este repo foi originalmente criado para o Replit** (`.replit`, `artifact.toml`, `post-merge.sh`). No aaPanel **nada disso roda automaticamente** — o deploy é manual via `git pull` + builds, conforme este guia.

---

## Visão geral da arquitetura em produção

| Componente | Como roda | Porta |
|---|---|---|
| **API server** (Express) | Projeto Node no aaPanel (Node.js projects) | `3000` (configurável) |
| **Frontend** (SPA React) | Build estático servido pelo **Nginx** | 80/443 |
| **Postgres** | Instalado no próprio servidor Oracle | `5432` (via `DATABASE_URL`) |
| **Git** | `git pull` manual com chave SSH `~/.ssh/id_ed25519` | — |

**Fluxo de dados da API para o frontend:** o SPA chama a API **mesmo-origin** (caminhos relativos `/api/...` — ver `custom-fetch.ts`). Portanto o Nginx precisa de **proxy reverso** de `/api` e `/sitemap.xml` → porta da API. O `sitemap.xml` é servido pela API (`app.get("/sitemap.xml", sitemapHandler)`).

---

## Procedimento de deploy (atualização de código)

### Opção A — Script automático (recomendado)

O script `scripts/deploy-production.sh` faz tudo: pull com chave SSH, install, **db push**, builds, libera a porta, e só deixa o "Start" do aaPanel para você (com healthcheck automático no fim).

```bash
bash /caminho/para/o/repo/scripts/deploy-production.sh
```

O script se localiza sozinho (não precisa estar em um diretório específico). Variáveis opcionais:

```bash
API_PORT=3000 bash scripts/deploy-production.sh        # se a API não estiver na 3000
GIT_SSH_KEY=/root/.ssh/outra-chave bash scripts/deploy-production.sh
```

### Opção B — Passo a passo manual

```bash
cd /caminho/do/repo

# 1. Puxar do Git (alias "gitpull" = linha abaixo; use a linha direto em scripts)
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main

# 2. Dependências (obrigatório se o lockfile mudou; inofensivo sempre)
pnpm install --frozen-lockfile

# 3. Schema — CRÍTICO (cria/atualiza a tabela articles)
pnpm --filter db push

# 4. Compilar o backend
pnpm --filter @workspace/api-server run build

# 5. Compilar o frontend (gera os estáticos do Nginx)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/estude-loterias run build

# 6. Liberar a porta da API para o religamento limpo
fuser -k 3000/tcp

# 7. No aaPanel: aba "Node.js projects" → projeto do Estude Loterias → [ Start ]
```

### Verificação pós-deploy

```bash
curl -fsS http://127.0.0.1:3000/api/healthz && echo "API OK"
curl -s http://127.0.0.1:3000/blog/posts | head -c 300   # blog público responde
curl -s https://estudeloterias.com.br/sitemap.xml | grep -o "/blog" | head   # sitemap inclui /blog
```

---

## Primeiro deploy / ativação do blog (uma vez)

1. **Configurar env vars no `.env` do servidor** (raiz do repo — a API lê de lá via `loadEnvFile`; o `drizzle.config.ts` também):
   - `DATABASE_URL` → Postgres do Oracle
   - `ADMIN_API_KEY` → **obrigatório definir** (sem ela o middleware usa o default `estude-admin-key-dev` e qualquer pessoa controla `/admin/blog`)
   - `LLM_API_KEY` → para gerar artigos com IA no admin de produção
   - `PORT` (da API) + `NODE_ENV=production`
2. **Rodar o deploy** (Opção A ou B acima) — o `pnpm --filter db push` cria a tabela `articles`.
3. **Nginx (vhost do estudeloterias.com.br)** — conferir que tem:
   - Docroot apontando para `artifacts/estude-loterias/dist/public`
   - Rewrite SPA: `location / { try_files $uri /index.html; }` (rotas `/blog`, `/admin/blog` são client-side)
   - Proxy reverso:
     ```nginx
     location /api/  { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
     location = /sitemap.xml { proxy_pass http://127.0.0.1:3000/sitemap.xml; }
     ```
   - (O site já está no ar hoje, então provavelmente só falta conferir o docroot novo / proxy do sitemap.)
4. **Validar** `/blog` no navegador + admin em `/admin/blog` (com a `ADMIN_API_KEY`).

---

## Migração de artigos do banco local → produção

O artigo inteiro (texto + imagem de capa em **base64** na coluna `cover_image_url`) vive em **uma linha** da tabela `articles` — não há arquivos em disco para copiar.

### Opção A — pg_dump (migração única, recomendada)

**Máquina local** (Postgres local é o container `estude-postgres`):
```bash
docker exec estude-postgres pg_dump --data-only --table=articles -U <USUARIO> <BANCO> > /tmp/articles.sql
scp /tmp/articles.sql usuario@servidor:/tmp/
```

**No servidor** (depois de rodar o deploy, para a tabela existir):
```bash
psql "$DATABASE_URL" -f /tmp/articles.sql
# Ajusta a sequência do id (senão o próximo insert colide):
psql "$DATABASE_URL" -c "SELECT setval('articles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM articles));"
```

> ⚠️ Rode **uma vez só** (`slug` é UNIQUE). Para repetir: `DELETE FROM articles;` antes.

### Opção B — sync contínuo por slug

Script `tsx` usando `@workspace/db` com upsert `ON CONFLICT (slug) DO UPDATE` entre a `DATABASE_URL` local e a de produção. Útil se você continuar redigindo localmente por um tempo. *(Ainda não criado — solicite se quiser.)*

---

## Observações para servidor com múltiplos sites

- O `fuser -k 3000/tcp` mata **somente** o que estiver na porta 3000 — os outros sites do Oracle (em outras portas/domínios) não são afetados. Confirme que a porta da API não colide com outro site.
- O `git pull` usa chave SSH específica (`id_ed25519`) — não interfere em outros repositórios no servidor.
- O `pnpm` usado é o do workspace deste repo (`pnpm install --frozen-lockfile` na raiz) — não afeta outros projetos Node do servidor.
- Para agendar deploys automáticos, um hook no GitHub Actions poderia rodar o mesmo script via SSH — fora de escopo por enquanto.

---

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| `/blog` retorna 500 | Tabela `articles` não existe em prod | Rodar `pnpm --filter db push` |
| Admin `/admin/blog` acessível sem chave | `ADMIN_API_KEY` não definida no `.env` | Definir a env e reiniciar a API |
| Pull dá "permission denied" | Chave SSH não é a usada pelo GitHub | Usar `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main` |
| `/blog` 404 no navegador, mas API responde | Rewrite SPA ausente no Nginx | `try_files $uri /index.html;` |
| `/sitemap.xml` 404 | Proxy do sitemap ausente | `location = /sitemap.xml { proxy_pass ...; }` |
| Geração de IA falha no admin | `LLM_API_KEY` ausente/inválida | Conferir `.env` + `LLM_BASE_URL`/`LLM_MODEL` |
