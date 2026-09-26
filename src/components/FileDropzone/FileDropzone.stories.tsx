import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { FileDropzone } from "./FileDropzone";

const meta: Meta<typeof FileDropzone> = {
  title: "Components/FileDropzone",
  component: FileDropzone,
  parameters: {
    layout: "padded",
    docs: { subtitle: "A drop target for files that doubles as a file-picker button" },
  },
  tags: ["autodocs"],
  args: { onFilesChange: fn(), accept: "image/*", hint: "PNG, JPG or WebP, up to 10 MB" },
};

export default meta;
type Story = StoryObj<typeof FileDropzone>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /Drop files here/ })).toHaveAttribute("data-state", "idle");
  },
};

/** Both sizes, idle, disabled and pending, on one surface. */
export const AllStates: Story = {
  render: (args) => (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <FileDropzone {...args} label="Add photos" />
      <FileDropzone {...args} size="sm" label="Add a photo" />
      <FileDropzone {...args} label="Disabled" disabled />
      <FileDropzone {...args} label="Uploading…" pending />
    </div>
  ),
};

/** What a drag over the target looks like. */
export const Active: Story = {
  render: (args) => <FileDropzone {...args} data-state="active" label="Release to upload" />,
};

/** The caller owns the list: the dropzone only reports what arrived. */
export const WithFileList: Story = {
  render: function WithFileListStory(args) {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="flex max-w-md flex-col gap-3">
        <FileDropzone {...args} multiple onFilesChange={(next) => setFiles((prev) => [...prev, ...next])} />
        <ul className="text-sm">
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
          ))}
        </ul>
      </div>
    );
  },
};

export const ComponentTokens = componentTokensStory("file-dropzone");
