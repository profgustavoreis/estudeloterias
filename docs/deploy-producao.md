# Deploy de Produção — Estude Loterias

Guia de deploy para o ambiente de produção atual: **Oracle Cloud Free** gerenciado via **aaPanel** (Apache httpd + Node.js projects — *não* Nginx), mesmo servidor que hospeda outros sites.

> ⚠️ **Este repo foi originalmente criado para o Replit** (`.replit`, `artifact.toml`, `post-merge.sh`). A produção **já não roda no Replit**: foi migrada para uma VM Oracle Cloud Free gerenciada com **aaPanel**, onde o Node.js do projeto também é gerenciado pelo aaPanel (Node.js projects / PM2). No aaPanel **nada do Replit roda automaticamente** — o deploy é manual via `git pull` + builds, conforme este guia. Replit é alvo **dev/legacy apenas**.
>
> **Serve-se o SPA a partir do api-server (injeção SEO server-side).** Desde o commit `e183637` o api-server é capaz de servir o build de produção do frontend (com injeção de `<head>` SEO por artigo em `/blog/:slug`) quando a env `FRONTEND_DIST` aponta para o `dist/public` do frontend. Em produção o **Apache passou a fazer proxy reverso de TODO o site para a API** (em vez de servir o SPA como estático). Isso é obrigatório para que o canonical/título/JSON-LD específico de cada artigo chegue ao crawler.

---

## Visão geral da arquitetura em produção

| Componente | Como roda | Porta |
|---|---|---|
| **API server** (Express) — **host do SPA em prod** | Projeto Node no aaPanel (Node.js projects); serve `/`, `/blog/*` (head SEO injetado), assets do `dist/public`, `/api` e `/sitemap.xml` | `3000` (configurável) |
| **Frontend** (SPA React) | Build em `artifacts/estude-loterias/dist/public` — servido **pelo api-server** via `FRONTEND_DIST` | via api-server |
| **Apache (httpd)** | Proxy reverso (via `mod_proxy`/`ProxyPass`) de **todas** as requisições (incl. `/blog/*`) → porta da API | 80/443 |
| **Postgres** | Instalado no próprio servidor Oracle | `5432` (via `DATABASE_URL`) |
| **Git** | `git pull` manual com chave SSH `~/.ssh/id_ed25519` | — |

**Fluxo de dados:** o SPA chama a API **mesmo-origin** (caminhos relativos `/api/...` — ver `custom-fetch.ts`). Como tudo passa pelo mesmo Express, `api`, `sitemap.xml` e o HTML de `/blog/*` (com head injetado) vêm do mesmo processo — sem bifurcação de rotas entre um host estático e um host dinâmico.

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

# 5. Compilar o frontend (gera o dist/public que o api-server vai servir)
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/estude-loterias run build

# 5b. Configurar FRONTEND_DIST no .env da raiz (lido pelo api-server no startup)
#     (o scripts/deploy-production.sh já faz isso automaticamente)
grep -q '^FRONTEND_DIST=' .env || echo 'FRONTEND_DIST=/caminho/para/o/repo/artifacts/estude-loterias/dist/public' >> .env

# 6. Liberar a porta da API para o religamento limpo
fuser -k 3000/tcp

# 7. No aaPanel: aba "Node.js projects" → projeto do Estude Loterias → [ Start ]
```

### Verificação pós-deploy

```bash
curl -fsS http://127.0.0.1:3000/api/healthz && echo "API OK"
curl -s http://127.0.0.1:3000/blog/posts | head -c 300   # blog público responde
curl -s https://estudeloterias.com.br/sitemap.xml | grep -o "/blog" | head   # sitemap inclui /blog
curl -s https://estudeloterias.com.br/blog/mega-sena-3041-premio-150-milhoes | grep -o '<link rel="canonical" href="[^"]*"' | head -1
#   → DEVE ser https://estudeloterias.com.br/blog/mega-sena-3041-premio-150-milhoes
#     (e não https://estudeloterias.com.br/ — o shell estático voltava o canonical da home)
curl -s https://estudeloterias.com.br/blog/mega-sena-3041-premio-150-milhoes | grep -o 'application/ld+json' | head -1  # JSON-LD presente no HTML cru
```

---

## Primeiro deploy / ativação do blog (uma vez)

1. **Configurar env vars no `.env` do servidor** (raiz do repo — a API lê de lá via `loadEnvFile`; o `drizzle.config.ts` também):
   - `DATABASE_URL` → Postgres do Oracle
   - `ADMIN_API_KEY` → **obrigatório definir** (sem ela o middleware usa o default debug e qualquer um controla `/admin/blog`)
   - `LLM_API_KEY` → para gerar artigos com IA no admin de produção
   - `PORT` (da API) + `NODE_ENV=production`
   - `FRONTEND_DIST` → **caminho absoluto até `artifacts/estude-loterias/dist/public`** no servidor. No **aaPanel (Node.js projects)** as env vars do projeto (incl. `FRONTEND_DIST`, `PORT`, `DATABASE_URL`) podem ser definidas no painel do projeto (seção *Env* / *Environment variables*). O `.env` na raiz do repo também é lido no startup se o projeto não sobrescrever.
2. **Rodar o deploy** (Opção A ou B acima) — o `pnpm --filter db push` cria a tabela `articles`.
3. **Apache (VirtualHost do estudeloterias.com.br)** — **proxy reverso de TODA a requisição para a API** (o api-server agora serve o SPA + head SEO). No **aaPanel → Sites → estudeloterias.com.br → 设置 (Configurações) → 反向代理** (ou edite o `<VirtualHost>` diretamente), aponte o docroot para qualquer pasta e configure o proxy em vez de servir estático:

   ```apache
   <VirtualHost *:80>
     ServerName estudeloterias.com.br
     # (o sitio é HTTPS via aaPanel/Let's Encrypt — o VirtualHost :443 repete o mesmo proxy)
     ProxyPreserveHost On
     ProxyPass        / http://127.0.0.1:3000/
     ProxyPassReverse / http://127.0.0.1:3000/
     # Ajustes comuns de proxy reverso:
     RequestHeader set X-Forwarded-Proto "https"
     RequestHeader set X-Forwarded-Host "estudeloterias.com.br"
   </VirtualHost>
   ```

   > Requer `mod_proxy` e `mod_proxy_http` habilitados (`sudo a2enmod proxy proxy_http` no Apache). **Remova o docroot/`FileMatch`/`DirectoryIndex` que sirva estático** — senão o Apache intercepta `/blog/*` antes de chegar à API e o head não é injetado. No aaPanel, o mais simples é usar o recurso **反向代理 (Reverse Proxy)** do site: defina *Domain Name* = estudeloterias.com.br e *Target URL* = `http://127.0.0.1:3000`.
   > Configuração equivalente por baixo é o `ProxyPass`/`ProxyPassReverse` acima — as configs do aaPanel geram exatamente isso no `httpd-vhosts.conf`.
4. **Validar** `/blog` no navegador + admin em `/admin/blog` (com a `ADMIN_API_KEY`), e conferir via `curl` que o canonical de `/blog/<slug>` é o do artigo (ver "Verificação pós-deploy" acima).

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
| Admin `/admin/blog` sem proteção | `ADMIN_API_KEY` não definida | Definir a env no projeto Node do aaPanel e reiniciar a API |
| Pull dá "permission denied" | Chave SSH não é a usada pelo GitHub | Usar `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519" git pull origin main` |
| `curl /blog/<slug>` mostra canonical da home (não do artigo) | SPA servido estático (sem passar pela Express) ou `FRONTEND_DIST` ausente | Setar `FRONTEND_DIST` no projeto Node do aaPanel (ou `.env`) + Apache fazendo proxy de `/` → API; remover docroot/` DirectoryIndex` estático do VirtualHost |
| `/blog` 404 no navegador | Rota API/SPA não alcançada (proxy `/` não configurado) | **aaPanel Reverse Proxy**: Target `http://127.0.0.1:3000` (equiv. `ProxyPass / http://127.0.0.1:3000/`) no vhost do domínio |
| `/sitemap.xml` 404 | Proxy do sitemap ausente | O `ProxyPass /` genérico cobre `/sitemap.xml` — conferir que o proxy de `/` está ativo |
| Geração de IA falha no admin | `LLM_API_KEY` ausente/inválida | Conferir env do projeto no aaPanel + `LLM_BASE_URL`/`LLM_MODEL` |

---

## apêndice — proxying Apache equivalente manual

Caso prefira editar o `VirtualHost` à mão em vez de usar o painel do aaPanel, o essencial é:

```apache
<VirtualHost *:443>
  ServerName estudeloterias.com.br
  ServerAlias www.estudeloterias.com.br

  SSLEngine on
  # ... certs do aaPanel/Let's Encrypt ...

  ProxyPreserveHost On
  ProxyPass        / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

O `ProxyPassReverse` corrige os headers de redirecionamento do Express para o domínio público — essencial para rotas que fazem redirect após POST no admin.