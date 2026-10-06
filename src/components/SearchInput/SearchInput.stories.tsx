import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { SearchInput, type SearchInputSuggestion } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
    docs: { subtitle: "An input with a search icon and a clear button" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

const ControlledSearchInput = (props: Omit<React.ComponentProps<typeof SearchInput>, "value" | "onValueChange">) => {
  const [value, setValue] = React.useState("");
  return <SearchInput {...props} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
  render: () => <ControlledSearchInput placeholder="Search..." />,
};

/**
 * Typing reveals the clear button; clearing puts focus back in the field.
 *
 * The clear button sits inside the input's padding, so whether it is clickable
 * at all is a hit-testing question — and where focus lands afterwards is a real
 * browser's answer, not a simulated one.
 */
export const TypeAndClear: Story = {
  render: () => <ControlledSearchInput placeholder="Search..." />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `textbox`, not `searchbox`: the component renders `type="text"`.
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "invoice");
    await expect(input).toHaveValue("invoice");

    await userEvent.click(canvas.getByRole("button", { name: /clear/i }));
    await expect(input).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = React.useState("hello world");
    return <SearchInput placeholder="Search..." value={value} onValueChange={setValue} />;
  },
};

export const Compact: Story = {
  render: () => <ControlledSearchInput placeholder="Search activity..." className="h-8 w-50" />,
};

export const Wide: Story = {
  render: () => <ControlledSearchInput placeholder="Search files..." className="w-80" />,
};

export const Disabled: Story = {
  render: () => <SearchInput placeholder="Search..." value="cannot edit" onValueChange={() => {}} disabled />,
};

const FRUITS: SearchInputSuggestion[] = ["Apple", "Apricot", "Banana", "Blackberry", "Blueberry", "Cherry", "Grape", "Mango", "Orange", "Peach"].map(
  (value) => ({ value })
);

/**
 * `suggestions` turns the field into a combobox. SearchInput renders the rows
 * as given and never filters them — the caller derives them from `value`, here
 * with a plain substring match. The top match is highlighted, so Enter picks
 * it; ArrowUp back to the typed text and Enter calls `onSubmit` with that.
 */
export const WithSuggestions: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    const [submitted, setSubmitted] = React.useState("");
    const suggestions = React.useMemo(() => FRUITS.filter((f) => f.value.toLowerCase().includes(value.toLowerCase())), [value]);
    return (
      <div className="w-72 space-y-2">
        <SearchInput
          aria-label="Search fruit"
          placeholder="Search fruit..."
          value={value}
          onValueChange={setValue}
          suggestions={suggestions}
          emptyMessage="No matching fruit"
          onSubmit={setSubmitted}
        />
        <p className="text-sm">Submitted: {submitted || "—"}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("combobox", { name: "Search fruit" });

    await userEvent.type(input, "berr");
    await expect(body.getAllByRole("option")).toHaveLength(2);

    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("Blackberry");
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

/**
 * Server search, simulated. The caller debounces, fetches and passes
 * `loading`; rows already shown stay put while the next batch is in flight.
 */
export const AsyncSuggestions: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<SearchInputSuggestion[]>([]);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
      if (!value) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      const timer = setTimeout(() => {
        setSuggestions(FRUITS.filter((f) => f.value.toLowerCase().startsWith(value.toLowerCase())));
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }, [value]);
    return (
      <div className="w-72">
        <SearchInput
          aria-label="Search fruit"
          placeholder="Search fruit..."
          value={value}
          onValueChange={setValue}
          suggestions={suggestions}
          loading={loading}
          emptyMessage="No matching fruit"
        />
      </div>
    );
  },
};

export const ComponentTokens = componentTokensStory("search-input", "search-input-dropdown", "search-input-option");
