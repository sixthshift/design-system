import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import type { ValidationError } from "../ValidationStatus";
import { ValidationStatus } from "../ValidationStatus";
import { Editor } from "./Editor";

/** Forces the app theme so the Monaco editor picks up the right theme */
const ForceTheme = ({ theme, children }: { theme: "light" | "dark"; children: ReactNode }) => {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);
  return <>{children}</>;
};

const meta: Meta<typeof Editor> = {
  title: "Components/Code/Editor",
  component: Editor,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Editor>;

const defaultCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`;

export const Default: Story = {
  args: {
    value: defaultCode,
    onChange: () => {},
    style: { height: "400px" },
  },
};

export const OneDark: Story = {
  render: () => (
    <ForceTheme theme="dark">
      <Editor value={defaultCode} onChange={() => {}} style={{ height: "400px" }} />
    </ForceTheme>
  ),
};

export const OneLight: Story = {
  render: () => (
    <ForceTheme theme="light">
      <Editor value={defaultCode} onChange={() => {}} style={{ height: "400px" }} />
    </ForceTheme>
  ),
};

export const ReadOnly: Story = {
  args: {
    value: defaultCode,
    onChange: () => {},
    readOnly: true,
    style: { height: "400px" },
  },
};

export const JavaScript: Story = {
  args: {
    value: `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
`,
    onChange: () => {},
    style: { height: "400px" },
  },
};

export const Json: Story = {
  args: {
    value: `{
  "name": "my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
    onChange: () => {},
    style: { height: "400px" },
  },
};

export const WithValidation: Story = {
  render: () => {
    const [code, setCode] = useState(`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// This line has an error
const x: number = "string";
`);
    const [errors, setErrors] = useState<ValidationError[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <Editor value={code} onChange={setCode} onValidate={setErrors} style={{ height: "300px" }} />
        <ValidationStatus errors={errors} />
      </div>
    );
  },
};

export const WithCustomTypes: Story = {
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
        <div className="text-gray-600 text-sm">This editor has custom type definitions injected. Try typing "myApi." to see IntelliSense.</div>
        <Editor value={code} onChange={setCode} typeDefinitions={customTypes} style={{ height: "300px" }} />
      </div>
    );
  },
};

export const FullExample: Story = {
  parameters: {
    a11y: {
      // The violation is inside Monaco's own line-number gutter, which this
      // component does not render or style. Monaco owns that DOM and its colour theme.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
  },
  render: () => {
    const [code, setCode] = useState(`interface User {
  id: number;
  name: string;
  email: string;
}

function validateUser(user: User): boolean {
  if (!user.name || !user.email) {
    return false;
  }
  return true;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

console.log(validateUser(user));
`);
    const [errors, setErrors] = useState<ValidationError[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">TypeScript Editor</h3>
            <p className="text-gray-600 text-sm">Full-featured code editor with validation and IntelliSense</p>
          </div>
          <div className="text-gray-500 text-sm">{errors.length === 0 ? "✓ No errors" : `${errors.length} error(s)`}</div>
        </div>
        <div className="rounded-lg border border-gray-200">
          <Editor value={code} onChange={setCode} onValidate={setErrors} style={{ height: "400px" }} />
        </div>
        {errors.length > 0 && <ValidationStatus errors={errors} />}
      </div>
    );
  },
};
