import { Router } from "express";
import { fetchCaixaResult, mapResultado } from "./loterias";

const router = Router();

const CAIXA_API = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

async function fetchCaixaConcurso(concurso: number) {
  const url = `${CAIXA_API}/megasena/${concurso}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!res.ok) throw new Error(`Caixa API error: ${res.status}`);
  return res.json() as Promise<any>;
}

// GET /api/mega-sena/resultado/ultimo
router.get("/mega-sena/resultado/ultimo", async (req, res) => {
  try {
    const raw = await fetchCaixaResult("megasena");
    res.json(mapResultado(raw, "megasena"));
  } catch (err) {
    req.log.error({ err }, "Failed to get mega-sena ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado da Mega-Sena" });
  }
});

// GET /api/mega-sena/resultados
router.get("/mega-sena/resultados", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const ano = req.query.ano ? parseInt(String(req.query.ano), 10) : null;

    // Get latest concurso to know total
    const latest = await fetchCaixaResult("megasena");
    const latestConcurso: number = (latest as any).numero;

    // Build list of concurso numbers to fetch (newest first)
    let allConcursos = Array.from({ length: latestConcurso }, (_, i) => latestConcurso - i);

    // If filtering by year, we fetch a wider range and filter
    // For simplicity, paginate from latestConcurso backwards
    const start = (page - 1) * limit;
    const selected = allConcursos.slice(start, start + limit);

    const results = await Promise.allSettled(
      selected.map(async (n) => {
        const raw = await fetchCaixaConcurso(n);
        return mapResultado(raw, "megasena");
      })
    );

    const resultados = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value)
      .filter((r) => !ano || new Date(r.data.split("/").reverse().join("-")).getFullYear() === ano);

    res.json({
      total: latestConcurso,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(latestConcurso / limit),
      resultados,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mega-sena resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/mega-sena/resultados/:concurso
router.get("/mega-sena/resultados/:concurso", async (req, res) => {
  const concurso = parseInt(req.params.concurso, 10);
  if (isNaN(concurso) || concurso < 1) {
    res.status(400).json({ error: "Concurso inválido" });
    return;
  }

  try {
    const raw = await fetchCaixaConcurso(concurso);
    res.json(mapResultado(raw, "megasena"));
  } catch (err) {
    req.log.error({ err, concurso }, "Failed to get concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/mega-sena/estatisticas
router.get("/mega-sena/estatisticas", async (req, res) => {
  try {
    // Fetch last 200 concursos for statistics
    const latest = await fetchCaixaResult("megasena");
    const latestConcurso: number = (latest as any).numero;

    const SAMPLE = Math.min(200, latestConcurso);
    const concursos = Array.from({ length: SAMPLE }, (_, i) => latestConcurso - i);

    const results = await Promise.allSettled(
      concursos.map((n) => fetchCaixaConcurso(n))
    );

    const validos = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    // Count frequency per dezena
    const freq: Record<string, { count: number; lastSeen: number | null }> = {};
    for (let i = 1; i <= 60; i++) {
      const key = String(i).padStart(2, "0");
      freq[key] = { count: 0, lastSeen: null };
    }

    validos.forEach((raw, idx) => {
      const dezenas: string[] = raw.listaDezenas || [];
      dezenas.forEach((d) => {
        const key = String(parseInt(d, 10)).padStart(2, "0");
        if (freq[key]) {
          freq[key].count++;
          if (freq[key].lastSeen === null) {
            freq[key].lastSeen = idx; // index from latest
          }
        }
      });
    });

    const frequenciaDezenas = Object.entries(freq)
      .map(([dezena, { count, lastSeen }]) => ({
        dezena,
        frequencia: count,
        percentual: SAMPLE > 0 ? Math.round((count / SAMPLE) * 1000) / 10 : 0,
        ultimoConcurso: lastSeen !== null ? latestConcurso - lastSeen : null,
        atraso: lastSeen !== null ? lastSeen : SAMPLE,
      }))
      .sort((a, b) => b.frequencia - a.frequencia);

    const atrasoMaiores = [...frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 15);

    // Stats from full sample
    const acumulados = validos.filter((r) => r.acumulado).length;
    const premiosMaximos = validos
      .map((r) => {
        const faixa1 = (r.listaRateioPremio || [])[0];
        return faixa1?.valorPremio ?? 0;
      })
      .filter((v) => v > 0);

    const maiorPremio = premiosMaximos.length ? Math.max(...premiosMaximos) : 0;
    let maiorPremioRaw = validos.find((r) => {
      const f = (r.listaRateioPremio || [])[0];
      return f?.valorPremio === maiorPremio;
    });

    res.json({
      totalConcursos: latestConcurso,
      frequenciaDezenas,
      atrasoMaiores,
      totalAcumulados: acumulados,
      percentualAcumulado: SAMPLE > 0 ? Math.round((acumulados / SAMPLE) * 1000) / 10 : 0,
      maiorPremio,
      maiorPremioData: maiorPremioRaw?.dataApuracao ?? "",
      maiorPremioConcurso: maiorPremioRaw?.numero ?? 0,
      maiorSequencia: 6,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/mega-sena/calendario
router.get("/mega-sena/calendario", async (req, res) => {
  try {
    const latest = await fetchCaixaResult("megasena");
    const raw = latest as any;

    const sorteios = [];
    const hoje = new Date();

    // Generate upcoming draw dates (Tue, Thu, Sat)
    const drawDays = [2, 4, 6]; // Tue=2, Thu=4, Sat=6
    let current = new Date(hoje);
    current.setHours(0, 0, 0, 0);

    // Next draw from API
    if (raw.dataProximoConcurso) {
      const [d, m, y] = raw.dataProximoConcurso.split("/");
      const nextDate = new Date(Number(y), Number(m) - 1, Number(d));
      sorteios.push({
        data: raw.dataProximoConcurso,
        diaSemana: nextDate.toLocaleDateString("pt-BR", { weekday: "long" }),
        concursoEstimado: raw.numero + 1,
        valorEstimado: raw.valorEstimadoProximoConcurso > 0 ? raw.valorEstimadoProximoConcurso : null,
        especial: false,
        descricao: null,
      });
    }

    // Generate next 20 draw dates
    let count = 0;
    let cursor = new Date(hoje);
    while (count < 20) {
      cursor.setDate(cursor.getDate() + 1);
      const day = cursor.getDay();
      if (drawDays.includes(day)) {
        const dd = String(cursor.getDate()).padStart(2, "0");
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const yyyy = cursor.getFullYear();
        const dateStr = `${dd}/${mm}/${yyyy}`;

        // Check if it's December 31
        const isVirada = cursor.getMonth() === 11 && cursor.getDate() === 31;

        sorteios.push({
          data: dateStr,
          diaSemana: cursor.toLocaleDateString("pt-BR", { weekday: "long" }),
          concursoEstimado: null,
          valorEstimado: null,
          especial: isVirada,
          descricao: isVirada ? "Mega da Virada" : null,
        });
        count++;
      }
    }

    res.json(sorteios.slice(0, 20));
  } catch (err) {
    req.log.error({ err }, "Failed to get calendario");
    res.status(500).json({ error: "Erro ao buscar calendário" });
  }
});

// GET /api/mega-sena/mega-da-virada
router.get("/mega-sena/mega-da-virada", async (req, res) => {
  try {
    // Known Mega da Virada concursos (approximate — these are well-known)
    // The Mega da Virada started in 2009 (concurso 1201)
    // We'll fetch the last ~16 years of Mega da Virada results
    // These concursos happen on Dec 31 each year
    const viradaConcursos = [
      1201, 1314, 1386, 1463, 1542, 1628, 1721, 1803, 1902, 2019, 2124, 2246, 2355, 2416, 2544, 2631
    ];

    const results = await Promise.allSettled(
      viradaConcursos.map((n) => fetchCaixaConcurso(n))
    );

    const historico = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => mapResultado((r as PromiseFulfilledResult<any>).value, "megasena"))
      .filter((r) => {
        // Only include results from December 31
        const [d] = r.data.split("/");
        return d === "31";
      })
      .reverse();

    const anoAtual = new Date().getFullYear();
    const dataProximaVirada = `31/12/${anoAtual}`;

    res.json({
      anoAtual,
      dataProximaVirada,
      valorEstimado: null,
      historico,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mega da virada");
    res.status(500).json({ error: "Erro ao buscar Mega da Virada" });
  }
});

// GET /api/mega-sena/resumo
router.get("/mega-sena/resumo", async (req, res) => {
  try {
    const raw = await fetchCaixaResult("megasena") as any;
    const latestConcurso: number = raw.numero;

    // Fetch a sample to find biggest prize
    const SAMPLE = 50;
    const concursos = Array.from({ length: Math.min(SAMPLE, latestConcurso) }, (_, i) => latestConcurso - i);
    const results = await Promise.allSettled(concursos.map((n) => fetchCaixaConcurso(n)));
    const validos = results.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<any>).value);

    let maiorPremio = 0;
    let maiorPremioConcurso = 0;
    let maiorPremioAno = 0;
    let totalGanhadores6 = 0;

    validos.forEach((r) => {
      const faixa1 = (r.listaRateioPremio || [])[0];
      if (faixa1) {
        totalGanhadores6 += faixa1.numeroDeGanhadores || 0;
        if (faixa1.valorPremio > maiorPremio) {
          maiorPremio = faixa1.valorPremio;
          maiorPremioConcurso = r.numero;
          const [, , y] = (r.dataApuracao || "").split("/");
          maiorPremioAno = y ? parseInt(y, 10) : 0;
        }
      }
    });

    res.json({
      totalConcursos: latestConcurso,
      acumulado: raw.acumulado,
      valorAtualAcumulado: raw.valorAcumuladoProximoConcurso > 0 ? raw.valorAcumuladoProximoConcurso : null,
      valorEstimadoProximo: raw.valorEstimadoProximoConcurso > 0 ? raw.valorEstimadoProximoConcurso : null,
      maiorPremio,
      maiorPremioConcurso,
      maiorPremioAno,
      totalGanhadores6,
      proximoSorteio: raw.dataProximoConcurso || null,
      ultimoConcurso: latestConcurso,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// POST /api/mega-sena/gerador
router.post("/mega-sena/gerador", async (req, res) => {
  const { quantidadeJogos = 1, quantidadeDezenas = 6 } = req.body || {};

  const jogosNum = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
  const dezenasNum = Math.min(15, Math.max(6, parseInt(String(quantidadeDezenas), 10)));

  // Price table for Mega-Sena
  const precos: Record<number, number> = {
    6: 5.0,
    7: 35.0,
    8: 140.0,
    9: 420.0,
    10: 1050.0,
    11: 2310.0,
    12: 4620.0,
    13: 8580.0,
    14: 15015.0,
    15: 25025.0,
  };

  const precoPorJogo = precos[dezenasNum] ?? 5.0;

  const jogos = Array.from({ length: jogosNum }, () => {
    const numeros = new Set<number>();
    while (numeros.size < dezenasNum) {
      numeros.add(Math.floor(Math.random() * 60) + 1);
    }
    return Array.from(numeros).sort((a, b) => a - b);
  });

  res.json({
    jogos,
    custo: jogosNum * precoPorJogo,
  });
});

export default router;
