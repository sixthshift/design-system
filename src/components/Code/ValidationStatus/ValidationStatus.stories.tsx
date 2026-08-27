import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { ValidationStatus } from "./ValidationStatus";

const meta: Meta<typeof ValidationStatus> = {
  title: "Components/Code/ValidationStatus",
  component: ValidationStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ValidationStatus>;

/**
 * Each error is rendered with its position, and an empty list renders nothing to
 * read — the distinction a smoke test cannot make.
 */
export const RenderingPlay: Story = {
  render: () => (
    <ValidationStatus
      errors={[
        { line: 5, column: 12, message: "Property 'name' does not exist on type 'User'.", severity: "error" },
        { line: 9, column: 3, message: "'result' is declared but never read.", severity: "warning" },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Property 'name' does not exist/)).toBeVisible();
    await expect(canvas.getByText(/never read/)).toBeVisible();
    // Positions are shown, not just messages.
    await expect(canvasElement.textContent).toMatch(/5/);
    await expect(canvasElement.textContent).toMatch(/9/);
  },
};

export const NoErrors: Story = {
  args: {
    errors: [],
  },
};

export const SingleError: Story = {
  args: {
    errors: [
      {
        line: 5,
        column: 12,
        message: "Property 'name' does not exist on type 'User'.",
        severity: "error",
      },
    ],
  },
};

export const MultipleErrors: Story = {
  args: {
    errors: [
      {
        line: 5,
        column: 12,
        message: "Property 'name' does not exist on type 'User'.",
        severity: "error",
      },
      {
        line: 8,
        column: 5,
        message: "Expected ';' but found '}'.",
        severity: "error",
      },
      {
        line: 12,
        column: 20,
        message: "Cannot find name 'undefinedVariable'.",
        severity: "error",
      },
    ],
  },
};

export const WithWarnings: Story = {
  args: {
    errors: [
      {
        line: 3,
        column: 7,
        message: "Variable 'unused' is declared but never used.",
        severity: "warning",
      },
      {
        line: 10,
        column: 15,
        message: "Function 'deprecatedMethod' is deprecated.",
        severity: "warning",
      },
    ],
  },
};

export const MixedSeverities: Story = {
  args: {
    errors: [
      {
        line: 5,
        column: 12,
        message: "Type 'string' is not assignable to type 'number'.",
        severity: "error",
      },
      {
        line: 8,
        column: 5,
        message: "Variable 'count' is declared but never used.",
        severity: "warning",
      },
      {
        line: 12,
        column: 20,
        message: "Consider using const instead of let for immutable variables.",
        severity: "info",
      },
      {
        line: 15,
        column: 8,
        message: "Missing return type annotation.",
        severity: "warning",
      },
    ],
  },
};

export const ManyErrors: Story = {
  args: {
    errors: [
      {
        line: 5,
        column: 12,
        message: "Property 'name' does not exist on type 'User'.",
        severity: "error",
      },
      {
        line: 8,
        column: 5,
        message: "Expected ';' but found '}'.",
        severity: "error",
      },
      {
        line: 12,
        column: 20,
        message: "Cannot find name 'undefinedVariable'.",
        severity: "error",
      },
      {
        line: 15,
        column: 8,
        message: "Variable 'unused' is declared but never used.",
        severity: "warning",
      },
      {
        line: 18,
        column: 15,
        message: "Type 'null' is not assignable to type 'string'.",
        severity: "error",
      },
      {
        line: 22,
        column: 10,
        message: "Function lacks return statement.",
        severity: "error",
      },
      {
        line: 25,
        column: 5,
        message: "Duplicate identifier 'id'.",
        severity: "error",
      },
    ],
  },
};

export const InfoOnly: Story = {
  args: {
    errors: [
      {
        line: 3,
        column: 5,
        message: "Consider using const instead of let.",
        severity: "info",
      },
      {
        line: 7,
        column: 10,
        message: "This can be simplified using optional chaining.",
        severity: "info",
      },
    ],
  },
};
