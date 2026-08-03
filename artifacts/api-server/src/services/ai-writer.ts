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

export async function generateArticleWithAi(
  params: AiGenerateInput,
): Promise<AiGenerateOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateFallbackArticle(params);
  }

  const { pauta, modalidade, tom = "informativo", tamanho = "medio" } = params;

  const prompt = `Você é um redator especialista em loterias brasileiras para o site Estude Loterias.
Gere um artigo completo e de alta qualidade sobre a seguinte pauta: "${pauta}".
Modalidade: ${modalidade || "Geral / Loterias"}.
Tom de voz: ${tom}.
Tamanho desejado: ${tamanho}.

Sua resposta DEVE ser um objeto JSON válido com as seguintes propriedades:
- title: Título atrativo do artigo
- slug: Slug do artigo (URL amigável em minúsculas com hífens)
- excerpt: Resumo do artigo (1 a 2 frases)
- content: Conteúdo completo do artigo formatado em Markdown rico
- modalidade: A modalidade da loteria (ou null/string)
- tags: Array de tags em texto (ex: ["megasena", "dicas"])
- seoTitle: Título para SEO (até 60 caracteres)
- seoDescription: Descrição para SEO (até 160 caracteres)`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        `Gemini API returned status ${response.status}. Falling back to default generation.`,
      );
      return generateFallbackArticle(params);
    }

    const data = (await response.json()) as any;
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return generateFallbackArticle(params);
    }

    const parsed = JSON.parse(rawText);

    if (!parsed.title || !parsed.content) {
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
    console.error("Error generating article with Gemini AI:", error);
    return generateFallbackArticle(params);
  }
}
