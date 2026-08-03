export interface AiGenerateInput {
  pauta: string;
  modalidade?: string | null;
  tom?: string;
  tamanho?: string;
}

export interface AiGenerateOutput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  modalidade?: string | null;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateFallbackArticle(params: AiGenerateInput): AiGenerateOutput {
  const { pauta, modalidade, tom = "informativo" } = params;
  const modTitle = modalidade
    ? modalidade.charAt(0).toUpperCase() + modalidade.slice(1)
    : "Loterias";

  const title = `Estratégias e Análise: ${pauta}`;
  const slug = slugify(title);
  const excerpt = `Confira nosso guia sobre ${pauta}. Descubra estatísticas, dicas práticas e análises para a ${modTitle}.`;

  const tags = [
    modalidade ? modalidade.toLowerCase() : "loterias",
    "estatisticas",
    "dicas",
    "estrategia",
  ];

  const seoTitle = `${title} | Estude Loterias`;
  const seoDescription = `Análise e dicas sobre ${pauta}. Aprenda estratégias e estatísticas para a ${modTitle} no Estude Loterias.`;

  const content = `# ${title}

## Introdução
Entender como funciona **${pauta}** é fundamental para quem busca fazer apostas mais conscientes e fundamentadas. Neste artigo, abordamos de forma **${tom}** os principais pontos que você precisa saber sobre este tema para a ${modTitle}.

## O Que Você Precisa Saber sobre ${pauta}
Ao analisar a ${modTitle}, é essencial olhar para os dados históricos. As estatísticas nos ajudam a identificar padrões e frequências de dezenas que podem orientar suas futuras apostas.

### Principais Dicas Práticas
1. **Analise a Frequência de Dezenas:** Verifique quais números têm sido sorteados com maior ou menor frequência.
2. **Distribuição Equilibrada:** Evite escolher apenas números pares ou apenas ímpares. Balancear a aposta aumenta numericamente a probabilidade dentro de padrões comuns.
3. **Gestão de Apostas:** Defina um orçamento fixo para seus jogos de loteria e nunca o ultrapasse.

## Análise de Probabilidades
Embora cada concurso de loteria seja um evento independente, acompanhar análises estatísticas atualizadas permite entender tendências matemáticas do jogo. 

> *Nota: Nenhuma estratégia garante 100% de acerto nas loterias, mas o estudo dos dados permite decisões mais bem embasadas.*

## Conclusão
Esperamos que este guia sobre **${pauta}** ajude você a aprimorar suas estratégias para a ${modTitle}. Continue acompanhando o **Estude Loterias** para mais análises, estatísticas atualizadas e ferramentas gratuitas de estudo de loterias.`;

  return {
    title,
    slug,
    excerpt,
    content,
    modalidade: modalidade || null,
    tags,
    seoTitle,
    seoDescription,
  };
}

interface SizeConfig {
  maxTokens: number;
  wordCount: string;
}

const SIZE_CONFIG: Record<string, SizeConfig> = {
  // Modelos do Zen (ex.: deepseek-v4-flash-free) são "thinking": queimam tokens
  // no reasoning_content antes de gerar o conteúdo. Os limites abaixo reservam
  // folga para o raciocínio; sem isso o conteúdo sai vazio (finish_reason=length).
  curto: { maxTokens: 8000, wordCount: "≈ 500 palavras (2-3 min de leitura)" },
  medio: { maxTokens: 12000, wordCount: "≈ 1.000 palavras (4-5 min de leitura)" },
  longo: { maxTokens: 16000, wordCount: "≈ 1.800+ palavras (guia detalhado, 7-10 min de leitura)" },
};

const DEFAULT_BASE_URL = "https://opencode.ai/zen/v1";
const DEFAULT_MODEL = "deepseek-v4-flash-free";
const DEFAULT_TIMEOUT_MS = 180000;

/** Strip optional ```json ... ``` code fences and whitespace before JSON.parse. */
function parseJsonResponse(rawText: string): any {
  let text = rawText.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }
  return JSON.parse(text);
}

export async function generateArticleWithAi(
  params: AiGenerateInput,
): Promise<AiGenerateOutput> {
  const { pauta, modalidade, tom = "informativo", tamanho = "medio" } = params;

  // Lido a cada chamada para que testes/recarga a quente reflitam mudanças.
  const baseUrl = (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const apiKey = (process.env.LLM_API_KEY || "").trim() || "public";
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  // Controle do modo thinking: "disabled" (default) desliga o raciocínio via
  // `thinking: {type: "disabled"}` — determinístico, 0 tokens de raciocínio e
  // faz temperature/tom voltarem a ter efeito (com thinking ligado o DeepSeek
  // ignora temperature/top_p). "low" | "medium" | "high" enviam
  // `reasoning_effort` (note: níveis são soft no gateway e estocásticos).
  const thinkingLevels = ["low", "medium", "high"] as const;
  const thinkingRaw = (process.env.LLM_THINKING || "disabled").trim().toLowerCase();
  const thinking: "disabled" | (typeof thinkingLevels)[number] =
    thinkingRaw === "disabled" || !(thinkingLevels as readonly string[]).includes(thinkingRaw)
      ? "disabled"
      : (thinkingRaw as (typeof thinkingLevels)[number]);

  const sizeConfig = SIZE_CONFIG[tamanho] || SIZE_CONFIG.medio;

  const prompt = `Você é um redator especialista em loterias brasileiras para o site Estude Loterias.
Gere um artigo completo e de alta qualidade sobre a seguinte pauta: "${pauta}".
Modalidade: ${modalidade || "Geral / Loterias"}.
Tom de voz: ${tom}.
Tamanho desejado: ${tamanho} — escreva ${sizeConfig.wordCount}.

Sua resposta DEVE ser um objeto JSON válido com as seguintes propriedades:
- title: Título atrativo do artigo
- slug: Slug do artigo (URL amigável em minúsculas com hífens)
- excerpt: Resumo do artigo (1 a 2 frases)
- content: Conteúdo completo do artigo formatado em Markdown rico
- modalidade: A modalidade da loteria (ou null/string)
- tags: Array de tags em texto (ex: ["megasena", "dicas"])
- seoTitle: Título para SEO (até 60 caracteres)
- seoDescription: Descrição para SEO (até 160 caracteres)`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "opencode/1.15.0",
        "x-opencode-client": "cli",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: sizeConfig.maxTokens,
        response_format: { type: "json_object" },
        // Modelos "thinking" (ex.: deepseek-v4-flash-free) queimam o orçamento de
        // tokens no reasoning_content antes de gerar conteúdo. Por padrão o
        // thinking fica desabilitado (LLM_THINKING=disabled): 0 tokens de
        // raciocínio e temperature/tom voltam a ter efeito. Nunca envie
        // `thinking` e `reasoning_effort` juntos (o gateway rejeita com 400).
        ...(thinking === "disabled"
          ? { thinking: { type: "disabled" } }
          : { reasoning_effort: thinking }),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `LLM API returned status ${response.status} (model: ${model}). Falling back to default generation.`,
      );
      return generateFallbackArticle(params);
    }

    const data = (await response.json()) as any;
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      console.warn(
        "LLM API returned an empty response. Falling back to default generation.",
      );
      return generateFallbackArticle(params);
    }

    const parsed = parseJsonResponse(String(rawText));

    if (!parsed.title || !parsed.content) {
      console.warn(
        "LLM response is missing required fields (title/content). Falling back to default generation.",
      );
      return generateFallbackArticle(params);
    }

    return {
      title: String(parsed.title),
      slug: parsed.slug ? slugify(String(parsed.slug)) : slugify(String(parsed.title)),
      excerpt: String(parsed.excerpt || ""),
      content: String(parsed.content),
      modalidade: parsed.modalidade ?? (modalidade || null),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
      seoTitle: String(parsed.seoTitle || parsed.title),
      seoDescription: String(parsed.seoDescription || parsed.excerpt || ""),
    };
  } catch (error) {
    console.error("Error generating article with AI:", error);
    return generateFallbackArticle(params);
  } finally {
    clearTimeout(timeoutId);
  }
}
