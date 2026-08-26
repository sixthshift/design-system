/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ValidationError } from "../ValidationStatus";
import type { Editor as EditorComponent } from "./Editor";

type CapturedMonacoProps = {
  value: string;
  defaultLanguage: string;
  theme: string;
  options: Record<string, unknown>;
  onChange: (value: string | undefined) => void;
  beforeMount: (monaco: unknown) => void;
  onMount: (editor: unknown, monaco: unknown) => void;
};

const themeState = vi.hoisted(() => ({ resolvedTheme: "light" as "light" | "dark" }));
let capturedProps: CapturedMonacoProps | null = null;

vi.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    theme: themeState.resolvedTheme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@monaco-editor/react", () => ({
  default: (props: CapturedMonacoProps) => {
    capturedProps = props;
    return (
      <textarea
        data-testid="monaco-editor-mock"
        aria-label="code editor"
        readOnly={Boolean(props.options?.readOnly)}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    );
  },
}));

/** Builds a minimal fake `monaco` namespace covering everything Editor.tsx touches. */
function createFakeMonaco() {
  const definedThemes: Record<string, unknown> = {};
  let markersChangeCallback: (() => void) | null = null;
  let modelMarkers: unknown[] = [];

  const monaco = {
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
    editor: {
      defineTheme: vi.fn((name: string, data: unknown) => {
        definedThemes[name] = data;
      }),
      onDidChangeMarkers: vi.fn((cb: () => void) => {
        markersChangeCallback = cb;
      }),
      getModelMarkers: vi.fn(() => modelMarkers),
    },
    languages: {
      typescript: {
        typescriptDefaults: {
          setWorkerOptions: vi.fn(),
          setCompilerOptions: vi.fn(),
          addExtraLib: vi.fn(),
        },
        getTypeScriptWorker: vi.fn(async () => async () => ({
          getEncodedSemanticClassifications: vi.fn(),
        })),
        ScriptTarget: { ES2020: 7 },
        ModuleResolutionKind: { NodeJs: 2 },
        ModuleKind: { CommonJS: 1 },
        JsxEmit: { React: 2 },
      },
      registerDocumentSemanticTokensProvider: vi.fn(),
    },
  };

  return {
    monaco,
    definedThemes,
    setModelMarkers: (markers: unknown[]) => {
      modelMarkers = markers;
    },
    triggerMarkersChange: () => markersChangeCallback?.(),
  };
}

function createFakeEditor(modelUri: unknown = "file:///test.ts") {
  return {
    focus: vi.fn(),
    getModel: vi.fn(() => ({ uri: modelUri })),
  };
}

describe("Editor", () => {
  let Editor: typeof EditorComponent;

  beforeEach(async () => {
    // The component registers a semantic-token provider exactly once, guarded
    // by module-level state — reset the module registry so each test starts
    // from a clean slate.
    vi.resetModules();
    themeState.resolvedTheme = "light";
    capturedProps = null;
    ({ Editor } = await import("./Editor"));
  });

  describe("rendering", () => {
    it("renders the mocked Monaco editor", () => {
      render(<Editor value="const x = 1;" onChange={() => {}} />);
      expect(screen.getByTestId("monaco-editor-mock")).toBeInTheDocument();
    });

    it("passes the value through to Monaco", () => {
      render(<Editor value="hello world" onChange={() => {}} />);
      expect(screen.getByTestId("monaco-editor-mock")).toHaveValue("hello world");
    });

    it("always requests the typescript language, regardless of content", () => {
      render(<Editor value="{}" onChange={() => {}} />);
      expect(capturedProps?.defaultLanguage).toBe("typescript");
    });

    it("spreads extra props and className onto the wrapper div", () => {
      const { container } = render(<Editor value="" onChange={() => {}} className="custom-class" data-testid="editor-wrapper" />);
      expect(screen.getByTestId("editor-wrapper")).toHaveClass("custom-class");
      expect(container.firstElementChild).toBe(screen.getByTestId("editor-wrapper"));
    });
  });

  describe("onChange wiring", () => {
    it("calls onChange with the new value when Monaco reports a change", () => {
      const handleChange = vi.fn();
      render(<Editor value="a" onChange={handleChange} />);

      fireEvent.change(screen.getByTestId("monaco-editor-mock"), { target: { value: "ab" } });

      expect(handleChange).toHaveBeenCalledWith("ab");
    });

    it("falls back to an empty string when Monaco reports undefined", () => {
      const handleChange = vi.fn();
      render(<Editor value="a" onChange={handleChange} />);

      capturedProps?.onChange(undefined);

      expect(handleChange).toHaveBeenCalledWith("");
    });
  });

  describe("readOnly", () => {
    it("passes readOnly through to Monaco options", () => {
      render(<Editor value="" onChange={() => {}} readOnly />);
      expect(capturedProps?.options.readOnly).toBe(true);
    });

    it("defaults readOnly to false", () => {
      render(<Editor value="" onChange={() => {}} />);
      expect(capturedProps?.options.readOnly).toBe(false);
    });
  });

  describe("theme selection", () => {
    it("uses the light Monaco theme when resolvedTheme is light", () => {
      themeState.resolvedTheme = "light";
      render(<Editor value="" onChange={() => {}} />);
      expect(capturedProps?.theme).toBe("ds-light");
    });

    it("uses the dark Monaco theme when resolvedTheme is dark", () => {
      themeState.resolvedTheme = "dark";
      render(<Editor value="" onChange={() => {}} />);
      expect(capturedProps?.theme).toBe("ds-dark");
    });
  });

  describe("beforeMount", () => {
    it("defines both the light and dark Monaco themes", () => {
      render(<Editor value="" onChange={() => {}} />);
      const { monaco, definedThemes } = createFakeMonaco();
      capturedProps?.beforeMount(monaco);

      expect(Object.keys(definedThemes)).toEqual(["ds-light", "ds-dark"]);
    });

    it("registers a semantic tokens provider for typescript and javascript exactly once", () => {
      render(<Editor value="" onChange={() => {}} />);
      const { monaco } = createFakeMonaco();

      capturedProps?.beforeMount(monaco);
      capturedProps?.beforeMount(monaco);

      expect(monaco.languages.registerDocumentSemanticTokensProvider).toHaveBeenCalledTimes(2);
      expect(monaco.languages.registerDocumentSemanticTokensProvider).toHaveBeenNthCalledWith(1, "typescript", expect.anything());
      expect(monaco.languages.registerDocumentSemanticTokensProvider).toHaveBeenNthCalledWith(2, "javascript", expect.anything());
    });
  });

  describe("onMount", () => {
    it("sets TypeScript compiler options merged with defaults", () => {
      render(<Editor value="" onChange={() => {}} compilerOptions={{ strict: true }} />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(monaco.languages.typescript.typescriptDefaults.setCompilerOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowJs: true,
          strict: true,
        })
      );
    });

    it("lets custom compilerOptions override the defaults", () => {
      render(<Editor value="" onChange={() => {}} compilerOptions={{ allowJs: false }} />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(monaco.languages.typescript.typescriptDefaults.setCompilerOptions).toHaveBeenCalledWith(expect.objectContaining({ allowJs: false }));
    });

    it("adds custom type definitions as an extra lib when provided", () => {
      render(<Editor value="" onChange={() => {}} typeDefinitions="declare const foo: string;" />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(monaco.languages.typescript.typescriptDefaults.addExtraLib).toHaveBeenCalledWith("declare const foo: string;", "ts:custom.d.ts");
    });

    it("does not add an extra lib when no type definitions are provided", () => {
      render(<Editor value="" onChange={() => {}} />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(monaco.languages.typescript.typescriptDefaults.addExtraLib).not.toHaveBeenCalled();
    });

    it("focuses the editor", () => {
      render(<Editor value="" onChange={() => {}} />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(editor.focus).toHaveBeenCalled();
    });

    it("does not subscribe to marker changes when onValidate is not provided", () => {
      render(<Editor value="" onChange={() => {}} />);
      const { monaco } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      expect(monaco.editor.onDidChangeMarkers).not.toHaveBeenCalled();
    });

    it("does not subscribe to marker changes when the editor has no model", () => {
      const handleValidate = vi.fn();
      render(<Editor value="" onChange={() => {}} onValidate={handleValidate} />);
      const { monaco } = createFakeMonaco();
      const editor = { focus: vi.fn(), getModel: vi.fn(() => null) };

      capturedProps?.onMount(editor, monaco);

      expect(monaco.editor.onDidChangeMarkers).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("maps Monaco markers to ValidationError objects and reports them via onValidate", () => {
      const handleValidate = vi.fn();
      render(<Editor value="" onChange={() => {}} onValidate={handleValidate} />);
      const { monaco, setModelMarkers, triggerMarkersChange } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);

      setModelMarkers([
        { startLineNumber: 3, startColumn: 5, message: "Type error", severity: monaco.MarkerSeverity.Error },
        { startLineNumber: 8, startColumn: 1, message: "Unused variable", severity: monaco.MarkerSeverity.Warning },
        { startLineNumber: 10, startColumn: 2, message: "Suggestion", severity: monaco.MarkerSeverity.Hint },
      ]);
      triggerMarkersChange();

      const expected: ValidationError[] = [
        { line: 3, column: 5, message: "Type error", severity: "error" },
        { line: 8, column: 1, message: "Unused variable", severity: "warning" },
        { line: 10, column: 2, message: "Suggestion", severity: "info" },
      ];
      expect(handleValidate).toHaveBeenCalledWith(expected);
    });

    it("reports an empty array when there are no markers", () => {
      const handleValidate = vi.fn();
      render(<Editor value="" onChange={() => {}} onValidate={handleValidate} />);
      const { monaco, triggerMarkersChange } = createFakeMonaco();
      const editor = createFakeEditor();

      capturedProps?.onMount(editor, monaco);
      triggerMarkersChange();

      expect(handleValidate).toHaveBeenCalledWith([]);
    });
  });
});
