# Exports do Google Search Console

Pasta local (não versionada) para os CSVs de **Páginas** do GSC usados pelo
script `scripts/gsc-to-indexing-whitelist.mjs`.

Como exportar (90 dias):

1. Abra o Google Search Console de `estudeloterias.com.br`;
2. **Desempenho** > aba **Pesquisa na Web**;
3. no filtro **Páginas**, escolha **contém** e informe `/resultado/`;
4. período: **Últimos 90 dias**;
5. **Exportar** e salve o CSV aqui.

O GSC limita cada CSV a 1000 linhas. Se o filtro retornar mais do que isso,
exporte em dois recortes e salve os dois arquivos aqui: o script casa as linhas
por URL (união; em caso de repetição, mantém o maior valor de cada métrica,
pois os recortes cobrem a mesma janela).

Depois rode, na raiz do repositório:

```bash
node scripts/gsc-to-indexing-whitelist.mjs
node scripts/gsc-to-indexing-whitelist.mjs --check   # não escreve; falha se divergir
```

Instruções completas no cabeçalho do script.
