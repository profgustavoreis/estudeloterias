---
name: Lottery sync strategy
description: Como a sincronização de dados lotéricos é feita neste projeto
---

**Fonte de dados:** API pública da Caixa (`servicebus2.caixa.gov.br`) com headers corretos.

**Estratégia:**
- Na inicialização do servidor: seed dos últimos 300 concursos para cada modalidade
- Mega-Sena tem prioridade (síncrono); outras modalidades em background com delay de 2s entre cada
- Cron jobs rodam Ter/Qui/Sáb às 22:30 e 23:30 (horário de Brasília) + a cada 4 horas
- Taxa de requests: 150ms de delay entre concursos individuais para evitar rate limiting

**APIs alternativas testadas:**
- `api.guidi.dev.br/loteria` — funciona mas tem timeout intermitente, não confiável para bulk
- `loteriascaixa-api.herokuapp.com` — Heroku free tier encerrado, evitar

**Backfill de gaps internos:**
- `seedInitialData` usa apenas MIN/MAX — não detecta gaps internos (ex.: 1613 concursos faltando entre concurso 1 e 3721 para Lotofácil).
- Solução: `backfillGaps(modalidade)` usa `generate_series` do Postgres para encontrar todos os concursos faltantes e os busca sequencialmente.
- Endpoint admin `POST /api/admin/backfill-gaps?modalidade=lotofacil` dispara async dentro do servidor — não corre risco de ser morto pelo sandbox (ao contrário de scripts externos nohup/disown).
- Scripts externos em lib/db ou scripts/ são mortos em ~90s pelo sandbox; sempre prefira endpoints internos para operações longas.

**Why:** O banco local é essencial para computar estatísticas de frequência rápido; a API da Caixa individualmente seria muito lenta e sofre rate limiting.

**How to apply:** Ver `artifacts/api-server/src/services/lottery-sync.ts` (`backfillGaps`) e `src/routes/admin.ts`. Rotas servem do DB primeiro, fallback para API da Caixa.
