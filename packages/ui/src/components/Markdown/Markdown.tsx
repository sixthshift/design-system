import { Body } from "@sixthshift/ui/body";
import { Emphasis } from "@sixthshift/ui/emphasis";
import { Heading } from "@sixthshift/ui/heading";
import { cn } from "@sixthshift/ui/utils";
import ReactMarkdown from "react-markdown";

export type MarkdownProps = {
  children: string;
  className?: string;
};

export const Markdown = ({ children, className }: MarkdownProps) => (
  <div className={cn("flex flex-col", className)}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => <Heading as="h3">{children}</Heading>,
        h2: ({ children }) => <Heading as="h4">{children}</Heading>,
        h3: ({ children }) => <Emphasis className="block">{children}</Emphasis>,
        p: ({ children }) => (
          <Body as="p" className="mt-2">
            {children}
          </Body>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-fg-brand underline">
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5">{children}</ol>,
        li: ({ children }) => <li className="text-fg-default text-sm">{children}</li>,
        code: ({ children }) => <code className="rounded bg-bg-subtle px-1.5 py-0.5 font-mono text-fg-emphasis text-xs">{children}</code>,
        pre: ({ children }) => <pre className="mt-2 overflow-x-auto rounded-md bg-bg-subtle p-3 font-mono text-xs">{children}</pre>,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
Markdown.displayName = "Markdown";
