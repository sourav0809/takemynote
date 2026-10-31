import { Fragment } from "react";

/** Renders **bold** and _italic_ inline for the preview. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|_.+?_)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        if (part.startsWith("_") && part.endsWith("_"))
          return <em key={index}>{part.slice(1, -1)}</em>;
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

const isTableDivider = (line: string) => /^\|[\s:|-]+\|$/.test(line);
const tableCells = (line: string) => line.split("|").slice(1, -1).map((cell) => cell.trim());

type PreviewToken = { kind: "line"; text: string } | { kind: "table"; rows: string[][] };

/** Groups consecutive Markdown table lines so each table renders as one element. */
function tokenize(markdown: string): PreviewToken[] {
  const tokens: PreviewToken[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("|")) {
      if (isTableDivider(line)) continue;
      const last = tokens.at(-1);
      if (last?.kind === "table") last.rows.push(tableCells(line));
      else tokens.push({ kind: "table", rows: [tableCells(line)] });
    } else if (line) {
      tokens.push({ kind: "line", text: line });
    }
  }
  return tokens;
}

function PreviewTable({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <div className="no-scrollbar -mx-1 overflow-x-auto px-1 py-1">
      <table className="w-full min-w-max border-collapse text-left text-[12.5px] sm:min-w-0">
        <thead>
          <tr className="border-b border-foreground/15 text-foreground">
            {header.map((cell, index) => (
              <th key={index} className="min-w-16 px-2 py-1.5 align-top font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="min-w-16 px-2 py-1.5 align-top break-words">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewLine({ text }: { text: string }) {
  if (text === "---") return <hr className="my-2 border-border" />;
  if (text.startsWith("### ")) return <p className="mt-1 text-[13px] font-semibold text-foreground">{text.slice(4)}</p>;
  if (text.startsWith("## ")) return <p className="mt-3 text-[15px] font-semibold text-foreground">{text.slice(3)}</p>;
  if (/^- \[[ x]\]/.test(text))
    return (
      <p className="flex items-center gap-2">
        <span className="size-3.5 shrink-0 rounded-[4px] border border-foreground/30" />
        <Inline text={text.slice(5).trim()} />
      </p>
    );
  if (/^\d+\./.test(text))
    return (
      <p className="pl-1">
        {text.match(/^\d+\./)?.[0]} <Inline text={text.replace(/^\d+\.\s?/, "")} />
      </p>
    );
  if (text === "-" || text.startsWith("- "))
    return (
      <p className="pl-1">
        • <Inline text={text.slice(2)} />
      </p>
    );
  if (text.startsWith(">"))
    return (
      <p className="border-l-2 border-primary/40 pl-3 italic">
        <Inline text={text.slice(1).trim() || "…"} />
      </p>
    );
  return (
    <p>
      <Inline text={text} />
    </p>
  );
}

/**
 * A lightweight, read-only rendering of a template's Markdown for the gallery
 * (headings, tasks, lists, quotes, tables, dividers). The note itself uses the editor.
 */
export function TemplatePreview({ title, markdown }: { title: string; markdown: string }) {
  return (
    <div className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-muted-foreground">
      <p className="mb-1 text-xl font-bold tracking-tight text-foreground">{title.trim() || "Untitled"}</p>
      {tokenize(markdown).map((token, index) =>
        token.kind === "table" ? (
          <PreviewTable key={index} rows={token.rows} />
        ) : (
          <PreviewLine key={index} text={token.text} />
        )
      )}
    </div>
  );
}
