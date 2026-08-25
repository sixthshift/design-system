/// <reference types="@testing-library/jest-dom" />
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Workspace as WorkspaceComponent } from "./Workspace";

type CapturedMonacoProps = {
  value: string;
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

/** Minimal fake `monaco` namespace, matching what Editor.tsx touches on mount. */
function createFakeMonaco() {
  let markersChangeCallback: (() => void) | null = null;
  let modelMarkers: unknown[] = [];

  const monaco = {
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
    editor: {
      defineTheme: vi.fn(),
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
        getTypeScriptWorker: vi.fn(async () => async () => ({ getEncodedSemanticClassifications: vi.fn() })),
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

/** Mounts the editor's Monaco instance and reports the given markers through onValidate. */
function reportMarkers(markers: unknown[]) {
  const { monaco, setModelMarkers, triggerMarkersChange } = createFakeMonaco();
  const editor = createFakeEditor();
  act(() => {
    capturedProps?.onMount(editor, monaco);
    setModelMarkers(markers);
    triggerMarkersChange();
  });
}

describe("Workspace", () => {
  let Workspace: typeof WorkspaceComponent;

  beforeEach(async () => {
    vi.resetModules();
    themeState.resolvedTheme = "light";
    capturedProps = null;
    ({ Workspace } = await import("./Workspace"));
  });

  describe("rendering", () => {
    it("renders the editor without toolbar or status bar props", () => {
      render(<Workspace value="const x = 1;" onChange={() => {}} />);
      expect(screen.getByTestId("monaco-editor-mock")).toHaveValue("const x = 1;");
    });

    it("merges custom className with the base wrapper classes", () => {
      const { container } = render(<Workspace value="" onChange={() => {}} className="custom-class" />);
      expect(container.firstElementChild).toHaveClass("custom-class");
      expect(container.firstElementChild).toHaveClass("rounded-lg");
    });

    it("spreads extra props onto the wrapper", () => {
      render(<Workspace value="" onChange={() => {}} data-testid="workspace-root" />);
      expect(screen.getByTestId("workspace-root")).toBeInTheDocument();
    });

    it("passes readOnly through to the underlying editor", () => {
      render(<Workspace value="" onChange={() => {}} readOnly />);
      expect(screen.getByTestId("monaco-editor-mock")).toHaveAttribute("readonly");
    });

    it("does not render a toolbar when no toolbar prop is given", () => {
      render(<Workspace value="" onChange={() => {}} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("toolbar", () => {
    it("renders toolbar actions as buttons and invokes their onClick handler", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Workspace value="" onChange={() => {}} toolbar={{ actions: [{ id: "format", label: "Format", onClick: handleClick }] }} />);

      const button = screen.getByRole("button", { name: "Format" });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders the primary action as a distinct button", async () => {
      const user = userEvent.setup();
      const handleSave = vi.fn();
      render(<Workspace value="" onChange={() => {}} toolbar={{ primaryAction: { id: "save", label: "Save", onClick: handleSave } }} />);

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it("renders both actions and a primary action together", () => {
      render(
        <Workspace
          value=""
          onChange={() => {}}
          toolbar={{
            actions: [{ id: "copy", label: "Copy", onClick: () => {} }],
            primaryAction: { id: "save", label: "Save", onClick: () => {} },
          }}
        />
      );

      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });

    it("disables an action button when the action is marked disabled", () => {
      render(<Workspace value="" onChange={() => {}} toolbar={{ actions: [{ id: "format", label: "Format", onClick: () => {}, disabled: true }] }} />);
      expect(screen.getByRole("button", { name: "Format" })).toBeDisabled();
    });

    it("renders custom left and right toolbar content", () => {
      render(<Workspace value="" onChange={() => {}} toolbar={{ leftContent: <span>File: index.ts</span>, rightContent: <span>Read-only</span> }} />);

      expect(screen.getByText("File: index.ts")).toBeInTheDocument();
      expect(screen.getByText("Read-only")).toBeInTheDocument();
    });
  });

  describe("status bar", () => {
    it("renders status bar items with labels and values", () => {
      render(<Workspace value="" onChange={() => {}} statusBar={{ items: [{ id: "lang", label: "Language", value: "TypeScript" }] }} />);
      expect(screen.getByText("Language")).toBeInTheDocument();
      expect(screen.getByText(": TypeScript")).toBeInTheDocument();
    });

    it("renders custom left and right status bar content", () => {
      render(<Workspace value="" onChange={() => {}} statusBar={{ leftContent: <span>Branch: main</span>, rightContent: <span>Ln 1, Col 1</span> }} />);
      expect(screen.getByText("Branch: main")).toBeInTheDocument();
      expect(screen.getByText("Ln 1, Col 1")).toBeInTheDocument();
    });

    it("invokes a status bar item's onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Workspace value="" onChange={() => {}} statusBar={{ items: [{ id: "lang", label: "Language", onClick: handleClick }] }} />);

      await user.click(screen.getByText("Language"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("validation", () => {
    it("does not render a validation panel when there are no errors", () => {
      render(<Workspace value="" onChange={() => {}} />);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("shows the validation panel once Monaco reports errors", () => {
      render(<Workspace value="" onChange={() => {}} />);

      reportMarkers([{ startLineNumber: 2, startColumn: 3, message: "Type error", severity: 8 }]);

      expect(screen.getByText("Type error")).toBeInTheDocument();
      expect(screen.getByText("1 error")).toBeInTheDocument();
    });

    it("forwards validation errors to the onValidate prop", () => {
      const handleValidate = vi.fn();
      render(<Workspace value="" onChange={() => {}} onValidate={handleValidate} />);

      reportMarkers([{ startLineNumber: 2, startColumn: 3, message: "Type error", severity: 8 }]);

      expect(handleValidate).toHaveBeenCalledWith([{ line: 2, column: 3, message: "Type error", severity: "error" }]);
    });

    it("hides the validation panel again once errors clear", () => {
      render(<Workspace value="" onChange={() => {}} />);

      reportMarkers([{ startLineNumber: 2, startColumn: 3, message: "Type error", severity: 8 }]);
      expect(screen.getByText("Type error")).toBeInTheDocument();

      reportMarkers([]);
      expect(screen.queryByText("Type error")).not.toBeInTheDocument();
    });
  });
});
