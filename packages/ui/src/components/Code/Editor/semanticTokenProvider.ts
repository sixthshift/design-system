/**
 * Semantic token provider backed by TypeScript's real language service.
 *
 * Monaco's standalone editor doesn't wire up semantic tokens — that's a VS Code
 * layer. We extend the TS worker to expose getEncodedSemanticClassifications,
 * then map the result to Monaco's delta-encoded format.
 */
import type { editor, languages, Uri } from "monaco-editor";

/** Matches TypeScript's v2020 semantic classifier exactly. */
const legend: languages.SemanticTokensLegend = {
  tokenTypes: ["class", "enum", "interface", "namespace", "typeParameter", "type", "parameter", "variable", "enumMember", "property", "function", "method"],
  tokenModifiers: ["declaration", "static", "async", "readonly", "defaultLibrary", "local"],
};

type GetWorker = () => Promise<
  (...uris: Uri[]) => Promise<{
    getEncodedSemanticClassifications(fileName: string, start: number, length: number): Promise<{ spans: number[] }>;
  }>
>;

export function createSemanticTokensProvider(getWorker: GetWorker): languages.DocumentSemanticTokensProvider {
  return {
    getLegend: () => legend,

    async provideDocumentSemanticTokens(model: editor.ITextModel) {
      const worker = await getWorker();
      const client = await worker(model.uri);
      const { spans } = await client.getEncodedSemanticClassifications(model.uri.toString(), 0, model.getValue().length);

      const data: number[] = [];
      let prevLine = 0;
      let prevChar = 0;

      for (let i = 0; i + 2 < spans.length; i += 3) {
        const classification = spans[i + 2]!;
        if (classification <= 255) continue; // legacy format — skip

        const pos = model.getPositionAt(spans[i]!);
        const line = pos.lineNumber - 1;
        const char = pos.column - 1;
        const deltaLine = line - prevLine;

        data.push(deltaLine, deltaLine === 0 ? char - prevChar : char, spans[i + 1]!, (classification >> 8) - 1, classification & 255);
        prevLine = line;
        prevChar = char;
      }

      return { data: new Uint32Array(data) };
    },

    releaseDocumentSemanticTokens() {},
  };
}

/** Extends the TS worker to expose getEncodedSemanticClassifications. */
const WORKER_EXTENSION = `
self.customTSWorkerFactory = (TypeScriptWorker) => {
  return class extends TypeScriptWorker {
    async getEncodedSemanticClassifications(fileName, start, length) {
      return this._languageService.getEncodedSemanticClassifications(
        fileName, { start, length }, "2020"
      );
    }
  };
};
`;

export const workerExtensionUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(WORKER_EXTENSION)}`;
