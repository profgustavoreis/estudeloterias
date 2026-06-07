import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const CAIXA_API = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const MODALIDADES = [
  {
    modalidade: "megasena",
    nome: "Mega-Sena",
    descricao: "Escolha de 6 a 15 números entre 01 e 60",
    cor: "#009640",
    icone: "megasena",
  },
  {
    modalidade: "lotofacil",
    nome: "Lotofácil",
    descricao: "Escolha de 15 a 20 números entre 01 e 25",
    cor: "#930089",
    icone: "lotofacil",
  },
  {
    modalidade: "quina",
    nome: "Quina",
    descricao: "Escolha de 5 a 15 números entre 01 e 80",
    cor: "#260085",
    icone: "quina",
  },
  {
    modalidade: "duplasena",
    nome: "Dupla Sena",
    descricao: "Escolha de 6 a 15 números entre 01 e 50",
    cor: "#a41024",
    icone: "duplasena",
  },
  {
    modalidade: "diadesorte",
    nome: "Dia de Sorte",
    descricao: "Escolha de 7 a 15 números entre 01 e 31",
    cor: "#f5a623",
    icone: "diadesorte",
  },
  {
    modalidade: "supersete",
    nome: "Super Sete",
    descricao: "Escolha 7 números, um por coluna (0 a 9)",
    cor: "#a8cf45",
    icone: "supersete",
  },
  {
    modalidade: "lotomania",
    nome: "Lotomania",
    descricao: "Escolha de 50 números entre 00 e 99",
    cor: "#f8901c",
    icone: "lotomania",
  },
  {
    modalidade: "timemania",
    nome: "Timemania",
    descricao: "Escolha 10 números entre 01 e 80 e um time do coração",
    cor: "#00b33c",
    icone: "timemania",
  },
  {
    modalidade: "maismilionaria",
    nome: "+Milionária",
    descricao: "Escolha 6 números entre 01 e 50 e 2 trevos entre 01 e 06",
    cor: "#3d1e6e",
    icone: "maismilionaria",
  },
];

async function fetchCaixaResult(modalidade: string) {
  const url = `${CAIXA_API}/${modalidade}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!res.ok) {
    throw new Error(`Caixa API error: ${res.status} for ${modalidade}`);
  }
  return res.json() as Promise<CaixaResultado>;
}

interface CaixaResultado {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  listaDezenasOrdemSorteio?: string[];
  acumulado: boolean;
  valorArrecadado?: number;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  dataProximoConcurso: string;
  localSorteio?: string;
  nomeMunicipioUFSorteio?: string;
  numeroConcursoAnterior?: number;
  numeroConcursoProximo?: number;
  listaMunicipioUFGanhadores?: Array<{ municipio: string; uf: string; numeroBilhetes: number }>;
  listaRateioPremio: Array<{
    numeroAcertos: number;
    descricaoFaixa: string;
    numeroDeGanhadores: number;
    valorPremio: number;
  }>;
  estadoEspecial?: string;
  nomeTimeCoracaoUltimoConcurso?: string;
}

function mapResultado(raw: CaixaResultado, modalidade: string) {
  const premios = (raw.listaRateioPremio || []).map((r, idx) => ({
    faixa: idx + 1,
    descricao: r.descricaoFaixa || `${r.numeroAcertos} acertos`,
    ganhadores: r.numeroDeGanhadores,
    valorPremio: r.valorPremio,
  }));

  return {
    concurso: raw.numero,
    data: raw.dataApuracao,
    dezenas: raw.listaDezenas || [],
    premios,
    acumulado: raw.acumulado,
    valorAcumulado:
      raw.valorAcumuladoProximoConcurso > 0
        ? raw.valorAcumuladoProximoConcurso
        : null,
    dataProximoConcurso: raw.dataProximoConcurso || null,
    valorEstimadoProximoConcurso:
      raw.valorEstimadoProximoConcurso > 0
        ? raw.valorEstimadoProximoConcurso
        : null,
    local: raw.nomeMunicipioUFSorteio || raw.localSorteio || null,
    localGanhadores: null,
    arrecadacaoTotal: raw.valorArrecadado || null,
  };
}

router.get("/loterias", async (req, res) => {
  try {
    const results = await Promise.allSettled(
      MODALIDADES.map(async (m) => {
        try {
          const raw = await fetchCaixaResult(m.modalidade);
          const resultado = mapResultado(raw, m.modalidade);
          const primeiroFaixa = resultado.premios[0];
          return {
            ...m,
            ultimoConcurso: resultado.concurso,
            dataUltimoSorteio: resultado.data,
            premioAcumulado: resultado.valorAcumulado,
            acumulado: resultado.acumulado,
            dezenas: resultado.dezenas.slice(0, 6),
          };
        } catch (err) {
          logger.warn({ err, modalidade: m.modalidade }, "Failed to fetch modalidade");
          return {
            ...m,
            ultimoConcurso: 0,
            dataUltimoSorteio: "",
            premioAcumulado: null,
            acumulado: false,
            dezenas: [],
          };
        }
      })
    );

    const loterias = results.map((r, idx) => {
      if (r.status === "fulfilled") return r.value;
      return {
        ...MODALIDADES[idx],
        ultimoConcurso: 0,
        dataUltimoSorteio: "",
        premioAcumulado: null,
        acumulado: false,
        dezenas: [],
      };
    });

    res.json(loterias);
  } catch (err) {
    req.log.error({ err }, "Failed to get loterias");
    res.status(500).json({ error: "Erro ao buscar loterias" });
  }
});

router.get("/loterias/:modalidade/resultado/ultimo", async (req, res) => {
  const { modalidade } = req.params;
  const valid = MODALIDADES.map((m) => m.modalidade);
  if (!valid.includes(modalidade)) {
    res.status(404).json({ error: "Modalidade não encontrada" });
    return;
  }

  try {
    const raw = await fetchCaixaResult(modalidade);
    res.json(mapResultado(raw, modalidade));
  } catch (err) {
    req.log.error({ err, modalidade }, "Failed to get ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

export { mapResultado, fetchCaixaResult };
export default router;
