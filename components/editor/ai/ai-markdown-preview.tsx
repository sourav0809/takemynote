import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface AiMarkdownPreviewProps {
  markdown: string;
  /** Shows a blinking caret after the text while it's still being written. */
  isStreaming?: boolean;
  className?: string;
}

/**
 * Renders an AI answer the way it will look in the note (lists, tasks,
 * headings, tables). Links are not clickable in the preview, and raw HTML
 * from the model is never rendered.
 */
export function AiMarkdownPreview({ markdown, isStreaming, className }: AiMarkdownPreviewProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-foreground dark:prose-invert",
        "prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5",
        "prose-pre:my-2 prose-table:my-2 [&_input]:mr-1.5 [&_input]:align-middle [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        isStreaming && "[&>*:last-child]:after:ml-0.5 [&>*:last-child]:after:inline-block [&>*:last-child]:after:h-[1.1em] [&>*:last-child]:after:w-px [&>*:last-child]:after:animate-pulse [&>*:last-child]:after:bg-primary [&>*:last-child]:after:align-text-bottom [&>*:last-child]:after:content-['']",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{ a: ({ children }) => <span className="text-primary underline">{children}</span> }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
