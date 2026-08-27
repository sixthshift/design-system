import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Download, Play, Save } from "lucide-react";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { Workspace } from "./Workspace";

const meta: Meta<typeof Workspace> = {
  title: "Components/Code/Workspace",
  component: Workspace,
  parameters: {
    importPath: "code-editor-workspace",
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Workspace>;

const defaultCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`;

/**
 * The workspace mounts its editor and reports edits upward.
 */
export const MountPlay: Story = {
  render: function MountPlayStory() {
    const [code, setCode] = useState(defaultCode);
    return (
      <div className="flex flex-col gap-2">
        <Workspace value={code} onChange={setCode} style={{ height: "260px" }} />
        <div data-testid="length">chars: {code.length}</div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector(".monaco-editor")).toBeTruthy(), { timeout: 15000 });
    await expect(canvas.getByTestId("length")).toHaveTextContent(`chars: ${defaultCode.length}`);
  },
};

export const Basic: Story = {
  render: () => {
    const [code, setCode] = useState(defaultCode);

    return <Workspace value={code} onChange={setCode} style={{ height: "400px" }} />;
  },
};

export const WithToolbar: Story = {
  render: () => {
    const [code, setCode] = useState(defaultCode);

    return (
      <Workspace
        value={code}
        onChange={setCode}
        style={{ height: "400px" }}
        toolbar={{
          actions: [
            {
              id: "format",
              label: "Format",
              onClick: () => alert("Format clicked"),
              variant: "ghost",
            },
            {
              id: "copy",
              label: "Copy",
              icon: <Copy className="h-4 w-4" />,
              onClick: () => alert("Copy clicked"),
              variant: "ghost",
            },
          ],
          primaryAction: {
            id: "save",
            label: "Save",
            icon: <Save className="h-4 w-4" />,
            onClick: () => alert("Save clicked"),
          },
        }}
      />
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const [code, setCode] = useState(`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Type error below
const x: number = "string";
`);

    return <Workspace value={code} onChange={setCode} style={{ height: "400px" }} />;
  },
};

export const WithStatusBar: Story = {
  render: () => {
    const [code, setCode] = useState(defaultCode);

    return (
      <Workspace
        value={code}
        onChange={setCode}
        style={{ height: "400px" }}
        statusBar={{
          items: [
            { id: "language", label: "Language", value: "TypeScript" },
            { id: "theme", label: "Theme", value: "Dark" },
          ],
          rightContent: <span>Ln 1, Col 1</span>,
        }}
      />
    );
  },
};

export const FullIDE: Story = {
  render: () => {
    const [code, setCode] = useState(`interface Config {
  apiKey: string;
  endpoint: string;
}

function initialize(config: Config): void {
  console.log("Initializing with config:", config);
}

const config: Config = {
  apiKey: "abc123",
  endpoint: "https://api.example.com"
};

initialize(config);
`);

    return (
      <Workspace
        value={code}
        onChange={setCode}
        style={{ height: "600px" }}
        toolbar={{
          leftContent: <span className="text-fg-subtle text-sm">config.ts</span>,
          actions: [
            {
              id: "run",
              label: "Run",
              icon: <Play className="h-4 w-4" />,
              onClick: () => alert("Running code..."),
              variant: "ghost",
            },
            {
              id: "download",
              label: "Download",
              icon: <Download className="h-4 w-4" />,
              onClick: () => alert("Downloading..."),
              variant: "ghost",
            },
          ],
          primaryAction: {
            id: "save",
            label: "Save",
            icon: <Save className="h-4 w-4" />,
            onClick: () => alert("Saved!"),
          },
        }}
        statusBar={{
          items: [
            { id: "language", label: "TypeScript" },
            { id: "encoding", label: "UTF-8" },
          ],
          rightContent: <span>Ln 1, Col 1</span>,
        }}
      />
    );
  },
};

export const CustomTypeDefinitions: Story = {
  render: () => {
    const [code, setCode] = useState(`// Custom API is available via IntelliSense
const result = myApi.fetchData({ id: 123 });
console.log(result);
`);

    const customTypes = `
declare const myApi: {
  fetchData(params: { id: number }): Promise<{ data: string }>;
  updateData(id: number, data: string): Promise<void>;
  deleteData(id: number): Promise<void>;
};
`;

    return (
      <div className="flex flex-col gap-4">
        <div className="text-fg-subtle text-sm">This editor has custom type definitions. Try typing "myApi." to see IntelliSense.</div>
        <Workspace
          value={code}
          onChange={setCode}
          style={{ height: "400px" }}
          typeDefinitions={customTypes}
          statusBar={{
            items: [{ id: "api", label: "Custom API Enabled" }],
          }}
        />
      </div>
    );
  },
};

export const JavaScript: Story = {
  render: () => {
    const [code, setCode] = useState(`function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`);

    return (
      <Workspace
        value={code}
        onChange={setCode}
        style={{ height: "400px" }}
        statusBar={{
          items: [{ id: "language", label: "JavaScript" }],
        }}
      />
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const [code] = useState(defaultCode);

    return (
      <Workspace
        value={code}
        onChange={() => {}}
        style={{ height: "400px" }}
        readOnly
        statusBar={{
          items: [{ id: "mode", label: "Read Only" }],
        }}
      />
    );
  },
};
