import MonacoEditor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { HTMLAttributes } from "react";
import { useCallback, useRef } from "react";
import { useTheme } from "../../../hooks/useTheme";
import type { ValidationError } from "../ValidationStatus";
import { createSemanticTokensProvider, workerExtensionUrl } from "./semanticTokenProvider";
import { defineThemes, PA_THEME_DARK, PA_THEME_LIGHT } from "./themes";

let semanticTokensRegistered = false;
function registerSemanticTokenProviders(monaco: typeof import("monaco-editor")) {
  if (semanticTokensRegistered) return;
  semanticTokensRegistered = true;

  // Extend the TS worker to expose getEncodedSemanticClassifications
  // @ts-expect-error - monaco.languages.typescript is marked deprecated but still functional
  monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
    customWorkerPath: workerExtensionUrl,
  });

  // @ts-expect-error - getTypeScriptWorker is marked deprecated but still functional
  const getWorker = () => monaco.languages.typescript.getTypeScriptWorker();
  monaco.languages.registerDocumentSemanticTokensProvider("typescript", createSemanticTokensProvider(getWorker));
  monaco.languages.registerDocumentSemanticTokensProvider("javascript", createSemanticTokensProvider(getWorker));
}

export type EditorProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onValidate?: ((errors: ValidationError[]) => void) | undefined;
  readOnly?: boolean;
  /**
   * Custom type definitions to add to Monaco for IntelliSense
   * Example: "declare const myApi: { method(): void };"
   */
  typeDefinitions?: string | undefined;
  /**
   * Custom TypeScript compiler options to merge with defaults
   */
  compilerOptions?: Record<string, unknown> | undefined;
};

/**
 * Generic Monaco-based code editor with TypeScript support
 *
 * Features:
 * - Syntax highlighting and IntelliSense
 * - Custom type definitions via props
 * - Validation with error reporting
 * - Configurable compiler options
 */
export const Editor = ({ value, onChange, onValidate, readOnly = false, className, typeDefinitions, compilerOptions = {}, ...props }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === "dark" ? PA_THEME_DARK : PA_THEME_LIGHT;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
      editorRef.current = editor;

      // Configure TypeScript compiler options
      // @ts-expect-error - monaco.languages.typescript is marked deprecated but still functional
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        // @ts-expect-error - ScriptTarget is deprecated but still functional
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        // @ts-expect-error - ModuleResolutionKind is deprecated but still functional
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        // @ts-expect-error - ModuleKind is deprecated but still functional
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        // @ts-expect-error - JsxEmit is deprecated but still functional
        jsx: monaco.languages.typescript.JsxEmit.React,
        allowNonTsExtensions: true,
        noEmit: true,
        esModuleInterop: true,
        allowJs: true,
        typeRoots: ["node_modules/@types"],
        // Merge custom compiler options
        ...compilerOptions,
      });

      // Add custom type definitions if provided
      if (typeDefinitions) {
        // @ts-expect-error - typescriptDefaults is deprecated but still functional
        monaco.languages.typescript.typescriptDefaults.addExtraLib(typeDefinitions, "ts:custom.d.ts");
      }

      // Set up validation
      const model = editor.getModel();
      if (model && onValidate) {
        monaco.editor.onDidChangeMarkers(() => {
          const markers = monaco.editor.getModelMarkers({ resource: model.uri });
          const errors: ValidationError[] = markers.map((marker: editor.IMarker) => ({
            line: marker.startLineNumber,
            column: marker.startColumn,
            message: marker.message,
            severity:
              marker.severity === monaco.MarkerSeverity.Error
                ? ("error" as const)
                : marker.severity === monaco.MarkerSeverity.Warning
                  ? ("warning" as const)
                  : ("info" as const),
          }));
          onValidate(errors);
        });
      }

      // Focus editor
      editor.focus();
    },
    [onValidate, typeDefinitions, compilerOptions]
  );

  const handleBeforeMount = useCallback((monaco: typeof import("monaco-editor")) => {
    defineThemes(monaco);
    registerSemanticTokenProviders(monaco);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value || "");
    },
    [onChange]
  );

  return (
    <div {...props} className={className}>
      <MonacoEditor
        height="100%"
        defaultLanguage="typescript"
        value={value}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        theme={monacoTheme}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          snippetSuggestions: "top",
          "semanticHighlighting.enabled": true,
        }}
      />
    </div>
  );
};
