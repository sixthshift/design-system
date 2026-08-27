import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Inputs/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A track-and-thumb on/off control with a pending state" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => <Switch label="Enable feature" />,
};

export const Checked: Story = {
  render: () => <Switch checked label="Feature enabled" />,
};

export const Disabled: Story = {
  render: () => <Switch disabled label="Unavailable option" />,
};

export const DisabledChecked: Story = {
  render: () => <Switch checked disabled label="Always enabled" />,
};

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <Switch checked={checked} onCheckedChange={setChecked} label="Click to toggle" />
        <p className="text-fg-subtle text-sm">Status: {checked ? "On" : "Off"}</p>
      </div>
    );
  },
};

export const SettingsExample: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Switch label="Push notifications" labelClassName="flex-row-reverse justify-between" />
      <Switch checked label="Email updates" labelClassName="flex-row-reverse justify-between" />
      <Switch label="Marketing emails" labelClassName="flex-row-reverse justify-between" />
    </div>
  ),
};

export const Pending: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch pending label="Saving..." />
      <Switch checked pending label="Saving..." />
    </div>
  ),
};

export const AsyncToggle: Story = {
  render: function AsyncToggleSwitch() {
    const [delay, setDelay] = useState(1500);
    const [shouldFail, setShouldFail] = useState(false);
    const [checked, setChecked] = useState(false);
    const [pending, setPending] = useState(false);
    const [lastResult, setLastResult] = useState<string | null>(null);

    const handleChange = (next: boolean) => {
      setPending(true);
      setLastResult(null);
      setTimeout(() => {
        if (shouldFail) {
          setLastResult("Failed — reverted");
        } else {
          setChecked(next);
          setLastResult(`Saved: ${next ? "On" : "Off"}`);
        }
        setPending(false);
      }, delay);
    };

    return (
      <div className="flex w-72 flex-col gap-6">
        <Switch checked={checked} pending={pending} onCheckedChange={handleChange} label="Toggle me" />

        <div className="flex flex-col gap-2 rounded-lg border border-border-normal p-3">
          <label className="flex items-center justify-between text-fg-normal text-sm">
            Delay
            <select
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="rounded border border-border-normal bg-bg-normal px-2 py-0.5 text-xs"
            >
              <option value={500}>500ms</option>
              <option value={1500}>1.5s</option>
              <option value={3000}>3s</option>
              <option value={5000}>5s</option>
            </select>
          </label>
          <span className="flex items-center justify-between text-fg-normal text-sm">
            Simulate failure
            <Switch checked={shouldFail} onCheckedChange={setShouldFail} aria-label="Simulate failure" />
          </span>
        </div>

        <p className="text-fg-subtle text-sm">{pending ? "Saving..." : (lastResult ?? (checked ? "On" : "Off"))}</p>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Switch label="Off" />
        <Switch checked label="On" />
      </div>
      <div className="flex items-center gap-4">
        <Switch disabled label="Disabled" />
        <Switch checked disabled label="Disabled On" />
      </div>
      <div className="flex items-center gap-4">
        <Switch pending label="Pending" />
        <Switch checked pending label="Pending On" />
      </div>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("switch");
