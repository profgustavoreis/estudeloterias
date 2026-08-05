import React from "react";
import { FileText } from "lucide-react";
import katex from "katex";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

const extractYouTubeId = (input: string): string | null => {
  const raw = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // youtube.com/watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/, // /embed/, /shorts/, /live/
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const getYouTubeStartSeconds = (input: string): number => {
  const match = input.trim().match(/[?&](?:t|start)=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const renderMath = (tex: string, displayMode: boolean, key: string | number): React.ReactNode => {
  try {
    const html = katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
    });
    return (
      <span
        key={key}
        dangerouslySetInnerHTML={{ __html: html }}
        className={displayMode ? "my-4 block text-center overflow-x-auto py-2 text-slate-900 dark:text-slate-100" : "inline-block px-0.5 text-slate-900 dark:text-slate-100"}
      />
    );
  } catch {
    return <code key={key} className="text-red-500 font-mono text-xs">{displayMode ? `$$${tex}$$` : `$${tex}$`}</code>;
  }
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = "" }) => {
  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        <FileText className="w-10 h-10 mb-3 stroke-[1.5] text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Prévia da Leitura Vazia</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Escreva algo na aba de edição para visualizar como seu artigo aparecerá no blog.</p>
      </div>
    );
  }

  const renderMarkdownToElements = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = "";
    let inMathBlock = false;
    let mathBlockContent: string[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];
    let listIsOrdered = false;
    let inTable = false;
    let tableRows: string[] = [];

    const flushList = (key: string) => {
      if (inList && listItems.length > 0) {
        if (listIsOrdered) {
          elements.push(
            <ol key={key} className="list-decimal list-inside space-y-1.5 my-3 pl-2 text-slate-700 dark:text-slate-300">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={key} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-slate-700 dark:text-slate-300">
              {listItems}
            </ul>
          );
        }
        inList = false;
        listItems = [];
      }
    };

    const flushTable = (key: string) => {
      if (inTable && tableRows.length > 0) {
        const parsedRows = tableRows.map((row) =>
          row
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim())
        );

        const headerRow = parsedRows[0];
        const contentRows = parsedRows.slice(1).filter((row) => !row.every((cell) => /^[-:\s]+$/.test(cell)));

        if (headerRow) {
          elements.push(
            <div key={key} className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full border-collapse text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headerRow.map((cell, idx) => (
                      <th key={`th-${idx}`} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {formatInlineText(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {contentRows.map((row, rIdx) => (
                    <tr key={`tr-${rIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={`td-${cIdx}`} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        inTable = false;
        tableRows = [];
      }
    };

    lines.forEach((line, index) => {
      const key = `md-line-${index}`;

      // Table line checking
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        flushList(`flush-before-table-${key}`);
        inTable = true;
        tableRows.push(line.trim());
        return;
      } else if (inTable) {
        flushTable(`flush-table-${key}`);
      }

      // Code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={key} className="my-4 rounded-xl overflow-hidden bg-slate-900 text-slate-100 border border-slate-800 shadow-md">
              {codeLanguage && (
                <div className="bg-slate-800/80 px-4 py-1.5 text-xs font-mono text-slate-400 border-b border-slate-700 uppercase tracking-wider">
                  {codeLanguage}
                </div>
              )}
              <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre font-mono">
                <code>{codeBlockContent.join("\n")}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBlockContent = [];
          codeLanguage = "";
        } else {
          flushList(`flush-${key}`);
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Single line block math $$...$$
      if (line.trim().startsWith("$$") && line.trim().endsWith("$$") && line.trim().length >= 4) {
        flushList(`flush-before-math-${key}`);
        const mathContent = line.trim().slice(2, -2).trim();
        elements.push(
          <div key={key} className="my-6 overflow-x-auto py-2 flex justify-center text-slate-900 dark:text-slate-100">
            {renderMath(mathContent, true, `math-${key}`)}
          </div>
        );
        return;
      }

      // Multi-line block math start/end
      if (line.trim() === "$$" || (line.trim().startsWith("$$") && !line.trim().slice(2).includes("$$"))) {
        if (inMathBlock) {
          elements.push(
            <div key={key} className="my-6 overflow-x-auto py-2 flex justify-center text-slate-900 dark:text-slate-100">
              {renderMath(mathBlockContent.join("\n"), true, `math-block-${key}`)}
            </div>
          );
          inMathBlock = false;
          mathBlockContent = [];
        } else {
          flushList(`flush-${key}`);
          inMathBlock = true;
          const contentAfterDelimiter = line.trim().slice(2);
          if (contentAfterDelimiter) {
            mathBlockContent.push(contentAfterDelimiter);
          }
        }
        return;
      }

      if (inMathBlock) {
        if (line.trim().endsWith("$$")) {
          const contentBeforeDelimiter = line.trim().slice(0, -2);
          if (contentBeforeDelimiter) {
            mathBlockContent.push(contentBeforeDelimiter);
          }
          elements.push(
            <div key={key} className="my-6 overflow-x-auto py-2 flex justify-center text-slate-900 dark:text-slate-100">
              {renderMath(mathBlockContent.join("\n"), true, `math-block-${key}`)}
            </div>
          );
          inMathBlock = false;
          mathBlockContent = [];
        } else {
          mathBlockContent.push(line);
        }
        return;
      }

      // Unordered lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        if (!inList || listIsOrdered) {
          flushList(`flush-before-ul-${key}`);
          inList = true;
          listIsOrdered = false;
        }
        const itemContent = line.trim().substring(2);
        listItems.push(
          <li key={`li-${key}`} className="leading-relaxed">
            {formatInlineText(itemContent)}
          </li>
        );
        return;
      }

      // Ordered lists
      const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        if (!inList || !listIsOrdered) {
          flushList(`flush-before-ol-${key}`);
          inList = true;
          listIsOrdered = true;
        }
        listItems.push(
          <li key={`li-${key}`} className="leading-relaxed">
            {formatInlineText(orderedMatch[2])}
          </li>
        );
        return;
      }

      // If line is not a list item, flush lists
      flushList(`flush-${key}`);

      // Blank line
      if (!line.trim()) {
        return;
      }

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={key} className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {formatInlineText(line.slice(2))}
          </h1>
        );
        return;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={key} className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-6 mb-3">
            {formatInlineText(line.slice(3))}
          </h2>
        );
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={key} className="text-xl font-semibold text-slate-800 dark:text-slate-200 tracking-tight mt-5 mb-2">
            {formatInlineText(line.slice(4))}
          </h3>
        );
        return;
      }

      if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={key} className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">
            {formatInlineText(line.slice(5))}
          </h4>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        let quoteText = line.slice(2);
        if (quoteText.startsWith("* ") || quoteText.startsWith("- ")) {
          quoteText = quoteText.slice(2);
        }
        elements.push(
          <blockquote key={key} className="border-l-4 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 pl-4 py-3 pr-2 my-4 rounded-r-lg not-italic text-slate-700 dark:text-slate-300">
            {formatInlineText(quoteText)}
          </blockquote>
        );
        return;
      }

      // Horizontal Rule
      if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
        elements.push(<hr key={key} className="my-6 border-slate-200 dark:border-slate-800" />);
        return;
      }

      // YouTube embeds (:::youtube <id/url> [| legenda])
      if (/^:::youtube\s+/i.test(line.trim())) {
        const rest = line.trim().replace(/^:::youtube\s+/i, "");
        const [urlOrId, ...captionParts] = rest.split("|");
        const videoId = extractYouTubeId(urlOrId);
        if (!videoId) {
          elements.push(
            <div key={key} className="my-4 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-xs font-medium text-red-600 dark:text-red-400">
              Link de YouTube inválido: {line.trim()}
            </div>
          );
          return;
        }
        const caption = captionParts.join("|").trim();
        const startSeconds = getYouTubeStartSeconds(urlOrId);
        const src = `https://www.youtube-nocookie.com/embed/${videoId}${startSeconds > 0 ? `?start=${startSeconds}` : ""}`;
        elements.push(
          <figure key={key} className="my-6">
            <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
              <iframe
                src={src}
                title={caption || "Vídeo do YouTube"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            {caption && (
              <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400 py-2">
                {caption}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Images
      const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        elements.push(
          <figure key={key} className="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full max-h-[400px] object-cover" />
            {imgMatch[1] && (
              <figcaption className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Paragraph
      elements.push(
        <p key={key} className="text-slate-700 dark:text-slate-300 leading-relaxed my-3 text-base">
          {formatInlineText(line)}
        </p>
      );
    });

    flushList("flush-end");
    flushTable("flush-end");
    return elements;
  };

  const formatInlineText = (text: string, depth = 0): React.ReactNode => {
    if (!text) return null;
    if (depth > 5) return text;

    const parts: React.ReactNode[] = [];
    let keyIdx = 0;

    // Regex matching display math, inline math with escaped \$ support, bold, italic, code, links
    const regex = /(\$\$[\s\S]*?\$\$|(?<![A-Za-z\\])\$(?!\$)(?:\\\$|[^\$\n])+(?<!\\)\$|\*\*[^\*\n]+\*\*|(?<!\*)\*(?!\*)[^\*\n]+(?<!\*)\*(?!\*)|`.*?`|\[.*?\]\(.*?\))/g;
    const tokens = text.split(regex);

    tokens.forEach((token) => {
      keyIdx++;
      if (!token) return;

      if (token.startsWith("$$") && token.endsWith("$$") && token.length >= 4) {
        const mathContent = token.slice(2, -2).trim();
        parts.push(renderMath(mathContent, true, `math-inline-block-${depth}-${keyIdx}`));
      } else if (token.startsWith("$") && token.endsWith("$") && token.length >= 3 && !token.slice(1, -1).includes("\n")) {
        const mathContent = token.slice(1, -1).trim();
        parts.push(renderMath(mathContent, false, `math-inline-${depth}-${keyIdx}`));
      } else if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
        const inner = token.slice(2, -2);
        parts.push(
          <strong key={`bold-${depth}-${keyIdx}`} className="font-semibold text-slate-900 dark:text-slate-100">
            {formatInlineText(inner, depth + 1)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
        const inner = token.slice(1, -1);
        parts.push(
          <em key={`italic-${depth}-${keyIdx}`} className="italic text-slate-800 dark:text-slate-200">
            {formatInlineText(inner, depth + 1)}
          </em>
        );
      } else if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
        parts.push(
          <code key={`code-${depth}-${keyIdx}`} className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
        const match = token.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          parts.push(
            <a key={`link-${depth}-${keyIdx}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-medium underline underline-offset-2 hover:text-emerald-700">
              {formatInlineText(match[1], depth + 1)}
            </a>
          );
        } else {
          parts.push(token);
        }
      } else {
        parts.push(token);
      }
    });

    return parts;
  };

  return (
    <article className={`prose prose-slate dark:prose-invert max-w-none space-y-2 ${className}`}>
      {renderMarkdownToElements(content)}
    </article>
  );
};
