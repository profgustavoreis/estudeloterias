---
name: Caixa API headers
description: Headers obrigatórios para chamar a API pública da Caixa sem receber 403
---

A API `https://servicebus2.caixa.gov.br/portaldeloterias/api/{modalidade}` requer os headers:

```
Origin: https://loterias.caixa.gov.br
Referer: https://loterias.caixa.gov.br/
```

Sem esses headers, a API retorna 403 (especialmente após algumas chamadas).

**Why:** A Caixa faz CORS check e verificação de Referer para bloquear scrapers.

**How to apply:** Sempre incluir esses headers em qualquer chamada à API da Caixa no sync service. Ver `artifacts/api-server/src/services/lottery-sync.ts` — constante `CAIXA_HEADERS`.
