# Guia de Implementação de Nova Loteria no Estude Loterias

> Guia passo a passo para agentes de IA. Seguir rigorosamente — pular etapas causa erros de tipo e
> inconsistências de UI.

## Loteries já implementadas (modelos de referência)
- Mega-Sena, Lotofácil, Quina, Lotomania, Timemania
- A Timemania é o **melhor modelo** para novas loterias simples (sem sorteio especial).

## Loteries faltantes (próximas a implementar)
- Dupla Sena: 2 sorteios por concurso, 6 dezenas de 01–50, R$ 2,50
- Super Sete: 7 colunas (0–9 cada), R$ 2,50
- +Milionária: 6 dezenas 01–50 + 2 trevos (1–6), R$ 6,00
- Dia de Sorte: 7 dezenas 01–31 + Mês de Sorte (1–12), R$ 2,50

---

## Checklist (14 passos, ~2h de trabalho)

### Fase 1 — Backend (API)

#### 1. Criar rota backend
**Arquivo:** `artifacts/api-server/src/routes/<modalidade>.ts`
**Modelo:** copiar `mega-sena.ts` (preferível — mais limpo, sem quirk do "00") ou `timemania.ts`, adaptar:
- `MODALIDADE` — string da modalidade (ex: `"duplasena"`)
- `toResultado()` — igual, só trocar o tipo se houver campos extras (ex: `timeDoCoracao` para Timemania)
- `GET /.../resultado/ultimo` — igual
- `GET /.../resultados` — igual (paginação com ano/ordem)
- `GET /.../resultados/:concurso` — igual
- `GET /.../estatisticas` — **⚠️ CRÍTICO: Seguir EXATAMENTE a estrutura do Mega-Sena.** Esta é a parte mais fácil de errar:
  - `SOMA_BUCKETS` — recalcular para o range da loteria (min = soma das N menores dezenas, max = soma das N maiores)
  - `PRIMOS`, `FIBONACCI`, `TRIANGULARES` — limitar ao range de dezenas
  - freq loop — ajustar range (`for i=01..XX`)
  - **⚠️ Grid e Moldura — OBRIGATÓRIO para TODAS as loterias numéricas.** Definir grid (R rows × C cols), `MOLDURA` Set (borda do grid), acumuladores `freqLinha` (R posições) e `freqColuna` (C posições). Ver Mega-Sena como referência.
  - **⚠️ `molduraRetrato`, `frequenciaPorLinha`, `frequenciaPorColuna` são CAMPOS OBRIGATÓRIOS na resposta JSON.** NUNCA remover.
  - Campos específicos da loteria (ex: `timesRanking` para Timemania) são adicionais, NÃO substitutos.
  - `makeDistrib` — ajustar `Array.from({ length: N+1 })` onde N = total de dezenas sorteadas
- `GET /.../resumo` — adaptar campos (ex: `totalGanhadores7` → `totalGanhadores6` para Dupla Sena)
- `POST /.../simulador` — adaptar:
  - Validação do array de dezenas (tamanho)
  - `faixaForAcertos()` — mapear acertos → faixa específica da loteria
  - `filtro` enum — ajustar opções
  - `contagemPorAcertos` — range 0..M onde M = total dezenas sorteadas
- `POST /.../gerador` — adaptar:
  - `pool` — range de dezenas
  - `custoPorJogo` — valor real da aposta
  - `slice(0, K)` — K = quantas dezenas por aposta

#### 2. Registrar rota no index.ts
**Arquivo:** `artifacts/api-server/src/routes/index.ts`
Adicionar `import <modalidade>Router from "./<modalidade>";` e `router.use(<modalidade>Router);`

#### 3. Atualizar MODALIDADES_META
**Arquivo:** `artifacts/api-server/src/routes/loterias.ts`
Adicionar entrada com `modalidade`, `nome`, `descricao`, `cor` (hex da marca), `icone`.
A `cor` aqui é usada no widget da home e nos cards — deve ser a cor institucional oficial.

---

### Fase 2 — Contrato da API

#### 4. Adicionar tag no OpenAPI
**Arquivo:** `lib/api-spec/openapi.yaml`
Adicionar `- name: <modalidade>` na seção `tags:` (linha ~23).

#### 5. Adicionar paths no OpenAPI
Copiar o bloco de paths da lotomania (7 endpoints) e adaptar:
- `operationId` — prefixo da modalidade (ex: `getDuplasenaUltimoResultado`)
- `tags` — nome da tag
- `$ref` — schemas específicos (criar no passo 6)
- Parâmetros de query/body — ajustar enums de filtro, tamanhos de array

#### 6. Adicionar schemas no OpenAPI
Copiar schemas da Mega-Sena e adaptar nomes:
- `Resultado<Nome>` — mesmo do `ResultadoMegaSena` (campos padrão + campos específicos se houver)
- `ResultadosPaginados<Nome>` — mesmo padrão
- **⚠️ `Estatisticas<Nome>` — DEVE incluir OBRIGATORIAMENTE:** `frequenciaDezenas`, `atrasoMaiores`, `totalAcumulados`, `percentualAcumulado`, `maiorPremio`, `maiorPremioData`, `maiorPremioConcurso`, `paresImpares`, `molduraRetrato`, `frequenciaPorLinha`, `frequenciaPorColuna`, `somaDezenas`, `numerosEspeciais`. Campos extras específicos da loteria (ex: `timesRanking`) são ADICIONAIS, nunca substitutos.
- `Resumo<Nome>` — campos específicos
- `SimuladorInput<Nome>` — `minItems`/`maxItems` do array de dezenas, enum de filtro
- `GeradorInput<Nome>` — mesmo padrão
- Schemas reutilizáveis (`FrequenciaDezena`, `ParesImpares`, `MolduraRetrato`, `FrequenciaFaixa`, `FrequenciaColuna`, `SomaDezenas`, `NumerosEspeciaisItem`) — NÃO recriar, reutilizar os já existentes via `$ref`.

#### 7. Rodar codegen
```bash
pnpm --filter @workspace/api-spec run codegen
```
**Verificação:** `grep -c "useGet<Nome>" lib/api-client-react/src/generated/api.ts` deve retornar >0.

---

### Fase 3 — Frontend (páginas)

#### 8. Criar hub.tsx
**Arquivo:** `artifacts/estude-loterias/src/pages/<modalidade>/hub.tsx`
**Modelo:** `pages/timemania/hub.tsx`
- Trocar hook: `useGet<Nome>UltimoResultado`
- `COR` = cor institucional
- Se a loteria usa bolas com cores diferentes do padrão (ex: Timemania amarelo+verde), definir `BALL_BG`/`BALL_TEXT` e usar `<LotteryBall color={BALL_BG} textColor={BALL_TEXT} />`
- Se for padrão (fundo=cor, texto=branco), usar `<LotteryBall color={COR} />`
- `quickLinks` — 10 ou 11 itens (11 se tiver sorteio especial)
- Card de "Dados do Sorteio" — texto descritivo específico da loteria
- `ConcursoNavigator`: `basePath` correto

#### 9. Criar ultimo-resultado.tsx
**Modelo:** `pages/timemania/ultimo-resultado.tsx`
- Hooks: `useGet<Nome>UltimoResultado`, `useGet<Nome>ResultadoConcurso`
- Tipo: `Resultado<Nome>`
- Cards de análise: adaptar para a loteria (ex: sem moldura/retrato se não for Lotomania)
- `RateioCard` — igual
- `Balls` helper — usar `BALL_BG`/`BALL_TEXT` se for o caso

#### 10. Criar resultados.tsx
**Modelo:** `pages/timemania/resultados.tsx`
- Hook: `useGet<Nome>Resultados`
- Ajustar número de skeletons (colunas da tabela, nº de dezenas)
- `years` — ano de início da loteria
- `Prêmio X acertos` no cabeçalho — trocar X pelo número correto

#### 11. Criar estatisticas.tsx — **⚠️ PÁGINA MAIS CRÍTICA. ESTRUTURA FIXA E INAPLIÁVEL.**
**Modelo OBRIGATÓRIO:** `pages/mega-sena/estatisticas.tsx` (NÃO usar Timemania como modelo — use Mega-Sena).
**Hook:** `useGet<Nome>Estatisticas` (somente este; NÃO usar `useGet<Nome>Resumo`).

A página DEVE ter exatamente 4 seções nesta ordem, sem omitir nenhuma:

**Seção 1 — Frequência de Dezenas** (3 cards lado a lado: Mais Sorteadas, Menos Sorteadas, Mais Atrasadas)
- Cada card: tabela com ranking (posição, LotteryBall, frequência/atraso, link "Concurso X →")
- Link "Ver todas →" em cada card apontando para `/modalidade/tabela-de-dezenas?tab=mais|menos|atrasadas`

**Seção 2 — Distribuição por Concurso** (2 rows):
- Row 1 (2 cards): Pares×Ímpares (gráfico de barras + CompactTable) | Moldura×Retrato (gráfico de barras + CompactTable + Accordion mostrando dezenas da moldura/retrato)
- Row 2 (2 cards): Soma das Dezenas (gráfico horizontal + CompactTable) | Publicidade (AdUnit)

**Seção 3 — Distribuição na Grade** (2 cards):
- Frequência por Linha (gráfico de barras + CompactTable + Accordion com dezenas por linha)
- Frequência por Coluna (gráfico de barras + CompactTable + Accordion com dezenas por coluna)

**Seção 4 — Números Especiais** (tabs Primos/Fibonacci/Triangulares):
- Grid de badges (todas as dezenas, destacando as da sequência)
- Gráfico de distribuição + CompactTable

**⚠️ REGRAS INVARIANTES para esta página:**
- Nunca omitir a seção de Moldura×Retrato ou Distribuição na Grade — TODAS as loterias numéricas as possuem.
- A grid é definida como R rows × 10 columns: `Math.ceil(totalDezenas / 10)` rows.
- Moldura = primeira linha + última linha + colunas laterais das linhas intermediárias.
- Cada seção TEM que ter `CompactTable` abaixo do gráfico e Accordion (quando relevante) com a lista de dezenas.
- Importar `Accordion, AccordionContent, AccordionItem, AccordionTrigger` de `@/components/ui/accordion`.
- As funções helper `DezBadge`, `CardSkeleton`, `CompactTable` DEVEM estar presentes.
- Links usam `style={{ color: COR }}` (NUNCA hardcode a cor com className tipo `text-[#009640]` — Mega-Sena faz isso por legado, mas o padrão correto é style).
- O campo `totalConcursos` vem de `stats.totalConcursos`.

#### 12. Criar estatisticas-tabela.tsx
**Modelo:** `pages/timemania/estatisticas-tabela.tsx`
- Hook: `useGet<Nome>Estatisticas`
- Ajustar range de dezenas no `UltimaVezLink`
- Remover lógica de `dezenaSortValue` se não tiver "00"

#### 13. Criar gerador.tsx
**Modelo:** `pages/timemania/gerador.tsx`
- Hook: `useGerarJogo<Nome>`
- `TOTAL_DEZENAS` — quantas dezenas por aposta
- `Slider` max — se aplicável (algumas loterias têm apostas múltiplas com qtd variável de dezenas)
- `PRECO_APOSTA` — valor real

#### 14. Criar simulador.tsx
**Modelo:** `pages/timemania/simulador.tsx`
- Hook: `useSimular<Nome>`
- `TOTAL_DEZENAS` — idem
- Grid do volante — range correto
- `FILTRO_LABELS` — labels específicos da loteria
- `FAIXAS_PREMIADAS` — set específico

#### 15. Criar conferidor.tsx
**Modelo:** `pages/timemania/conferidor.tsx`
- Hooks: `useGet<Nome>UltimoResultado`, `useGet<Nome>ResultadoConcurso`
- `TOTAL_DEZENAS`, `FAIXA_FOR_ACERTOS`, `FAIXAS_PREMIADAS`
- Grid do volante — range correto

#### 16. Criar como-jogar.tsx
**Modelo:** `pages/timemania/como-jogar.tsx`
- Regras específicas da loteria (confirmar no site da Caixa!)
- Dias de sorteio, valor, Teimosinha, Surpresinha
- Links internos para gerador e conferidor

#### 17. Criar premiacao.tsx
**Modelo:** `pages/timemania/premiacao.tsx`
- Percentuais de distribuição (confirmar no site da Caixa!)
- Tabela de faixas × acertos × probabilidades
- Regras de acumulação

#### 18. Criar faq.tsx
**Modelo:** `pages/timemania/faq.tsx`
- ~15-18 perguntas específicas
- Adaptar respostas para a loteria

#### 19. Criar pagina-especial.tsx (se aplicável)
Apenas se a loteria tiver sorteio especial (Mega da Virada, Independência, São João).
Timemania e Lotomania **não** têm — pular este passo para elas.

---

### Fase 4 — Integração (4 arquivos)

#### 20. App.tsx — rotas
**Arquivo:** `artifacts/estude-loterias/src/App.tsx`
- Adicionar imports das páginas
- Adicionar blocos `<Route>` — copiar padrão da Timemania (12-13 rotas)
- Se não tiver sorteio especial, são 12 rotas; com especial, 13

#### 21. Sidebar.tsx — navegação lateral
**Arquivo:** `artifacts/estude-loterias/src/components/layout/Sidebar.tsx`
- Adicionar seção `<Modalidade>` (5 itens: Painel, Resultado, Resultados, Estatísticas, Gerador)
- Adicionar seção `<Modalidade> — Info` (3 itens sem especial, 4 com especial)

#### 22. TopNav.tsx — menu superior
**Arquivo:** `artifacts/estude-loterias/src/components/layout/TopNav.tsx`
- Adicionar arrays `tools`, `info`, `all`
- Adicionar `modalidadeActive = !!bestMatch(location, <nome>All)`
- Adicionar `&& (l.label !== "<Nome>" || !<nome>Active)` no filter
- Adicionar bloco `LotteryDropdown` condicional no desktop nav
- Adicionar bloco mobile menu condicional
- Adicionar entrada em `outrasLoterias` com `cor` e `href` — posicionar depois das já ativas

#### 23. AppLayout.tsx — footer
**Arquivo:** `artifacts/estude-loterias/src/components/layout/AppLayout.tsx`
- Adicionar `{ name: "<Nome>", href: "/<modalidade>", active: true }` na posição correta (ordem alfabética ou de importância)

---

### Fase 5 — Homepage widget

#### 24. Atualizar home.tsx (se necessário)
**Arquivo:** `artifacts/estude-loterias/src/pages/home.tsx`
- Apenas se a loteria tiver cores de bola diferentes do padrão (ex: Timemania amarelo)
- Adicionar condição `is<Nome>` no `DezenasSection`
- A maioria usa `color={loteria.cor}` (fundo=cor, texto=branco) — não precisa mexer

---

### Fase 6 — Verificação

#### 25. Typecheck
```bash
pnpm run typecheck
```
**Deve passar sem erros.** Erros comuns:
- `queryKey` ausente no `useQuery` do conferidor → passar número direto sem `{ query: { enabled } }`
- `number | null | undefined` não atribuível a `number | null` → ajustar tipo para `number | null | undefined`
- Import não encontrado → verificar nome do hook gerado pelo codegen

#### 26. Verificação manual
- `pnpm --filter @workspace/api-server run dev` — testar `GET /api/<modalidade>/resultado/ultimo`
- `pnpm --filter @workspace/estude-loterias run dev` — navegar em todas as páginas
- Verificar dados no banco: `docker exec -i estude-postgres psql -U postgres -d estudeloterias -c "SELECT modalidade, COUNT(*) FROM lottery_results GROUP BY modalidade;"`
- Se não houver dados, rodar backfill: `curl -X POST http://localhost:5000/api/admin/backfill-gaps?modalidade=<modalidade>`

---

## Gotchas e decisões de design

### Cores das bolas
- **Padrão:** fundo = cor institucional, texto = branco → `<LotteryBall color={COR} />`
- **Timemania (exceção):** fundo = amarelo `#FFF600`, texto = verde `#049645` → `<LotteryBall color={BALL_BG} textColor={BALL_TEXT} />`
- Novas loterias: verificar se a cor institucional funciona bem como fundo de bola. Se for muito clara (ex: `#f5a623` Dia de Sorte), considerar inverter.

### Simulador — faixaForAcertos
Cada loteria tem mapeamento diferente de acertos → faixa. Confirmar no site da Caixa.
- Timemania: 7→1, 6→2, 5→3, 4→4, 3→5
- Lotomania: 20→1, 19→2, 18→3, 17→4, 16→5, 15→6, 0→7
- Dupla Sena: 6→1, 5→2, 4→3, 3→4 (2 sorteios!)
- +Milionária: 6→1, 5→2, 4→3, 3→4 + trevos

### Dupla Sena — caso especial
Tem **2 sorteios por concurso** (`dezenas` e `dezenas2`). O `ResultadoDuplasena` precisa do campo extra `dezenas2`. Ver `home.tsx` `DezenasSection` para o tratamento de `dezenas2`.

### +Milionária e Dia de Sorte — campos extras
Ambas têm campos especiais no metadata:
- +Milionária: `trevos` (array de 2 strings)
- Dia de Sorte: `nomeEspecial` (string, "Mês de Sorte")
Ver `home.tsx` para o tratamento de `trevos` e `nomeEspecial`.

### Super Sete — estrutura única
7 colunas, cada uma com números de 0–9. Não tem paralelo exato nas loterias existentes. O gerador precisa de UI especial (colunas, não grade numérica). O backend também é diferente — sortear 1 número por coluna.

### Não pule o codegen
Editar o openapi.yaml **sem rodar codegen** faz o typecheck quebrar — os hooks não são gerados. É o passo mais fácil de esquecer.

### ⚠️ Estrutura invariante do Resumo Estatístico
**Esta é a parte onde mais se erra.** A página de estatísticas (estatisticas.tsx) NUNCA deve ser "simplificada" ou ter seções removidas. Toda loteria numérica (01–XX) tem grid, moldura, linhas e colunas. A estrutura é:

1. **Frequência de Dezenas** — 3 cards: Mais Sorteadas, Menos Sorteadas, Mais Atrasadas
2. **Distribuição por Concurso** — Pares×Ímpares + Moldura×Retrato (row 1), Soma das Dezenas + Ad (row 2)
3. **Distribuição na Grade** — Frequência por Linha + Frequência por Coluna
4. **Números Especiais** — Tabs Primos/Fibonacci/Triangulares

**O backend DEVE retornar:** `molduraRetrato`, `frequenciaPorLinha`, `frequenciaPorColuna` no JSON de estatísticas. Sem esses campos, a seção 3 quebra.

### Definição da Grid e Moldura
Para uma loteria com N dezenas (01 a N):
- **Grid:** `Math.ceil(N / 10)` rows × 10 columns (última linha pode ter menos de 10)
- **Moldura:** primeira linha + última linha + primeira coluna das linhas intermediárias + última coluna das linhas intermediárias
- Exemplo Timemania (80 dezenas, 8×10): moldura = 01-10, 71-80, 11,21,31,41,51,61, 20,30,40,50,60,70 → 36 dezenas
- Exemplo Mega-Sena (60 dezenas, 6×10): moldura = 01-10, 51-60, 11,20,21,30,31,40,41,50 → 28 dezenas

### Confirme regras no site da Caixa
**Sempre** verificar regras, percentuais e probabilidades em `https://loterias.caixa.gov.br/Paginas/<Modalidade>.aspx` antes de escrever as páginas de como-jogar e premiacao. Várias páginas antigas tinham dados errados copiados de fontes não oficiais.
