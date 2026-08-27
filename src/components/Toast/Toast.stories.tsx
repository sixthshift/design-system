import { Button } from "@sixthshift/design-system/button";
import { OverlayProvider, useToast } from "@sixthshift/design-system/overlay";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Feedback/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A transient notification for the outcome of an action" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toast>;

// Helper to show toast on button click
function ToastDemo({ children, buttonLabel = "Show Toast" }: { children: (props: { onClose: () => void }) => React.ReactNode; buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
      {open && children({ onClose: () => setOpen(false) })}
    </div>
  );
}

/** Shown by the play function so axe audits the toast, not just its trigger. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show Toast" }));
    // Neutral intent is a polite live region — see Message's intent-to-role map.
    await expect(await screen.findByRole("status")).toBeInTheDocument();
  },
  render: () => (
    <ToastDemo>
      {({ onClose }) => (
        <Toast title="Notification" onClose={onClose}>
          Something happened that you should know about.
        </Toast>
      )}
    </ToastDemo>
  ),
};

export const Intents: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Toast standalone={false} intent="neutral" title="Info" icon={<Info />} onClose={() => {}}>
        This is a neutral notification.
      </Toast>
      <Toast standalone={false} intent="success" title="Success" icon={<CheckCircle />} onClose={() => {}}>
        Your changes have been saved.
      </Toast>
      <Toast standalone={false} intent="warning" title="Warning" icon={<AlertTriangle />} onClose={() => {}}>
        Your session will expire in 5 minutes.
      </Toast>
      <Toast standalone={false} intent="danger" title="Error" icon={<XCircle />} onClose={() => {}}>
        Failed to save changes. Please try again.
      </Toast>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastDemo>
      {({ onClose }) => (
        <Toast
          intent="success"
          title="Email archived"
          icon={<CheckCircle />}
          action="Undo"
          onAction={() => {
            console.log("Undo clicked");
            onClose();
          }}
          onClose={onClose}
        >
          The email has been moved to archive.
        </Toast>
      )}
    </ToastDemo>
  ),
};

export const TitleOnly: Story = {
  render: () => <ToastDemo>{({ onClose }) => <Toast intent="success" title="Saved successfully" onClose={onClose} />}</ToastDemo>,
};

export const LongContent: Story = {
  render: () => (
    <Toast standalone={false} intent="warning" title="Connection Issue" icon={<AlertTriangle />} onClose={() => {}}>
      We're having trouble connecting to the server. Your changes will be saved locally and synced when the connection is restored.
    </Toast>
  ),
};

// =============================================================================
// Stacking Demo (uses OverlayContext)
// =============================================================================

const toastConfigs = [
  {
    intent: "success" as const,
    title: "Changes saved",
    icon: <CheckCircle />,
    children: "Your document has been saved.",
  },
  {
    intent: "warning" as const,
    title: "Low storage",
    icon: <AlertTriangle />,
    children: "You're running low on storage space.",
  },
  {
    intent: "danger" as const,
    title: "Upload failed",
    icon: <XCircle />,
    children: "Could not upload file. Please try again.",
  },
  {
    intent: "neutral" as const,
    title: "New message",
    icon: <Info />,
    children: "You have a new message from the team.",
  },
];

function StackingDemoContent() {
  const indexRef = useRef(0);

  // Create hooks for each toast type
  const successToast = useToast({
    ...toastConfigs[0],
    duration: 10000,
  });
  const warningToast = useToast({
    ...toastConfigs[1],
    duration: 10000,
  });
  const dangerToast = useToast({
    ...toastConfigs[2],
    duration: 10000,
  });
  const neutralToast = useToast({
    ...toastConfigs[3],
    duration: 10000,
  });

  const toasts = [successToast, warningToast, dangerToast, neutralToast];

  const addToast = () => {
    const toast = toasts[indexRef.current % toasts.length];
    toast?.openToast();
    indexRef.current++;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="max-w-xs text-center text-fg-subtle text-sm">
        Click the button multiple times to see toasts stack. They auto-dismiss after 10 seconds or click the X to close.
      </p>
      <Button onClick={addToast}>Add Toast</Button>
    </div>
  );
}

export const Stacking: Story = {
  render: () => (
    <OverlayProvider>
      <StackingDemoContent />
    </OverlayProvider>
  ),
  parameters: {
    layout: "fullscreen",
    docs: {
      story: {
        inline: false,
        iframeHeight: 400,
      },
    },
  },
};
