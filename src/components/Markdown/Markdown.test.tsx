/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Markdown } from "./Markdown";

describe("Markdown", () => {
  describe("rendering", () => {
    it("renders plain text content", () => {
      render(<Markdown>Hello world</Markdown>);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("renders nothing but the wrapper for an empty string", () => {
      const { container } = render(<Markdown>{""}</Markdown>);
      const wrapper = container.firstElementChild;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.textContent).toBe("");
    });

    it("merges custom className onto the wrapper", () => {
      const { container } = render(<Markdown className="custom-class">content</Markdown>);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("flex");
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Markdown ref={ref}>content</Markdown>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("headings", () => {
    it("renders h1 as a level-3 heading", () => {
      render(<Markdown># Title</Markdown>);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Title");
      expect(heading.tagName).toBe("H3");
    });

    it("renders h2 as a level-4 heading", () => {
      render(<Markdown>## Subtitle</Markdown>);
      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toHaveTextContent("Subtitle");
      expect(heading.tagName).toBe("H4");
    });

    it("renders h3 as inline emphasis rather than a heading", () => {
      render(<Markdown>### Not a heading</Markdown>);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      const emphasis = screen.getByText("Not a heading");
      expect(emphasis.tagName).toBe("SPAN");
      expect(emphasis).toHaveClass("block");
      expect(emphasis).toHaveClass("font-medium");
    });
  });

  describe("emphasis", () => {
    it("renders bold text with strong", () => {
      render(<Markdown>Some **bold** text</Markdown>);
      const bold = screen.getByText("bold");
      expect(bold.tagName).toBe("STRONG");
    });

    it("renders italic text with em", () => {
      render(<Markdown>Some *italic* text</Markdown>);
      const italic = screen.getByText("italic");
      expect(italic.tagName).toBe("EM");
    });
  });

  describe("paragraphs", () => {
    it("renders a paragraph as a p element with body styling", () => {
      render(<Markdown>A simple paragraph.</Markdown>);
      const paragraph = screen.getByText("A simple paragraph.");
      expect(paragraph.tagName).toBe("P");
      expect(paragraph).toHaveClass("mt-2");
    });

    it("renders multiple paragraphs separately", () => {
      render(
        <Markdown>{`First paragraph.

Second paragraph.`}</Markdown>
      );
      expect(screen.getByText("First paragraph.")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("renders a link with href, target and rel attributes", () => {
      render(<Markdown>[click here](https://example.com)</Markdown>);
      const link = screen.getByRole("link", { name: "click here" });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveClass("underline");
    });
  });

  describe("lists", () => {
    it("renders an unordered list with list items", () => {
      render(
        <Markdown>{`- Apple
- Banana
- Cherry`}</Markdown>
      );
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("UL");
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent("Apple");
      expect(items[2]).toHaveTextContent("Cherry");
    });

    it("renders an ordered list with list items", () => {
      render(
        <Markdown>{`1. First
2. Second
3. Third`}</Markdown>
      );
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
      expect(items[1]).toHaveTextContent("Second");
    });
  });

  describe("code", () => {
    it("renders inline code with a code element", () => {
      render(<Markdown>Run `bun test` now</Markdown>);
      const code = screen.getByText("bun test");
      expect(code.tagName).toBe("CODE");
      expect(code).toHaveClass("font-mono");
    });

    it("renders fenced code blocks inside a pre element", () => {
      render(
        <Markdown>{`\`\`\`
const x = 1;
\`\`\``}</Markdown>
      );
      const code = screen.getByText("const x = 1;");
      expect(code.tagName).toBe("CODE");
      expect(code.closest("pre")).not.toBeNull();
      expect(code.closest("pre")).toHaveClass("overflow-x-auto");
    });
  });

  describe("blockquotes", () => {
    it("renders a blockquote element wrapping its content", () => {
      render(<Markdown>{"> Quoted text"}</Markdown>);
      const quoted = screen.getByText("Quoted text");
      expect(quoted.closest("blockquote")).not.toBeNull();
    });
  });

  describe("raw HTML handling", () => {
    it("does not execute or render raw script tags as elements", () => {
      const { container } = render(<Markdown>{"<script>window.__pwned = true;</script>"}</Markdown>);
      expect(container.querySelector("script")).toBeNull();
      expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    });

    it("does not render arbitrary raw HTML tags embedded in markdown", () => {
      const { container } = render(<Markdown>{'Before <strong class="injected">raw</strong> after'}</Markdown>);
      expect(container.querySelector('strong[class="injected"]')).toBeNull();
    });

    it("does not render a raw img tag with an onerror handler", () => {
      const { container } = render(<Markdown>{'<img src="x" onerror="window.__pwned2 = true">'}</Markdown>);
      expect(container.querySelector("img")).toBeNull();
      expect((window as unknown as { __pwned2?: boolean }).__pwned2).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles malformed markdown without throwing", () => {
      expect(() => render(<Markdown>{"# Unclosed **bold and [broken link("}</Markdown>)).not.toThrow();
    });

    it("handles very long content", () => {
      const longText = "word ".repeat(2000).trim();
      render(<Markdown>{longText}</Markdown>);
      expect(screen.getByText(/^word word/)).toBeInTheDocument();
    });

    it("handles special characters and markdown-escape sequences", () => {
      render(<Markdown>{"Special chars: & < > \" ' \\* not bold \\*"}</Markdown>);
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
      expect(screen.getByText(/\* not bold \*/)).toBeInTheDocument();
    });

    it("renders nothing extra for whitespace-only content", () => {
      const { container } = render(<Markdown>{"   \n\n   "}</Markdown>);
      expect(container.firstElementChild?.textContent).toBe("");
    });
  });
});
