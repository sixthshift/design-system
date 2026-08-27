import type { Meta, StoryObj } from "@storybook/react";
import { componentTokensStory } from "../../stories/recipes/componentTokensStory";
import { Message, MessageBody, MessageDescription, MessageIcon, MessageTitle } from ".";

const meta: Meta<typeof Message> = {
  title: "Components/Message",
  component: Message,
  parameters: {
    layout: "centered",
    docs: { subtitle: "An inline feedback banner that stays where the caller puts it" },
  },
  tags: ["autodocs"],
  argTypes: {
    intent: {
      control: "select",
      options: ["neutral", "danger", "success", "warning"],
    },
    size: {
      control: "select",
      options: ["md", "sm"],
    },
    title: {
      control: "text",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Message>;

// =============================================================================
// BASIC STORIES
// =============================================================================

export const Default: Story = {
  args: {
    children: "This is a message to inform you about something.",
  },
};

export const WithTitle: Story = {
  args: {
    title: "Information",
    children: "This is a message with a title and description.",
  },
};

// =============================================================================
// INTENT VARIANTS
// =============================================================================

export const IntentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Message intent="neutral" title="Neutral">
        This is a neutral message for general information.
      </Message>
      <Message intent="success" title="Success">
        Your changes have been saved successfully.
      </Message>
      <Message intent="warning" title="Warning">
        Please review your input before proceeding.
      </Message>
      <Message intent="danger" title="Error">
        Something went wrong. Please try again.
      </Message>
    </div>
  ),
};

// =============================================================================
// SIZE VARIANTS
// =============================================================================

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Message size="md" title="Medium Size">
        This is the default size message with standard padding.
      </Message>
      <Message size="sm" title="Small Size">
        This is a smaller message, useful for inline feedback.
      </Message>
    </div>
  ),
};

// =============================================================================
// WITH ICONS
// =============================================================================

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Message intent="neutral" icon={<InfoIcon />} title="Information">
        This message includes a custom icon.
      </Message>
      <Message intent="success" icon={<CheckIcon />} title="Success">
        Your changes have been saved successfully.
      </Message>
      <Message intent="warning" icon={<AlertIcon />} title="Warning">
        Please review your input before proceeding.
      </Message>
      <Message intent="danger" icon={<ErrorIcon />} title="Error">
        Something went wrong. Please try again.
      </Message>
    </div>
  ),
};

// =============================================================================
// COMPOUND USAGE
// =============================================================================

export const CompoundComponents: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Message intent="neutral">
        <MessageIcon>
          <InfoIcon />
        </MessageIcon>
        <MessageBody>
          <MessageTitle>Custom Compound Layout</MessageTitle>
          <MessageDescription>Use compound components for maximum flexibility in layout and structure.</MessageDescription>
        </MessageBody>
      </Message>

      <Message intent="success">
        <MessageIcon>
          <CheckIcon />
        </MessageIcon>
        <MessageBody>
          <MessageTitle>File uploaded</MessageTitle>
          <MessageDescription>
            <span className="font-medium">document.pdf</span> has been uploaded successfully.
          </MessageDescription>
        </MessageBody>
      </Message>
    </div>
  ),
};

// =============================================================================
// USE CASE EXAMPLES
// =============================================================================

export const FormFeedback: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email-input" className="font-medium text-sm">
          Email
        </label>
        <input
          id="email-input"
          type="email"
          className="rounded-md border border-border-normal bg-bg-normal px-3 py-2 text-sm"
          placeholder="Enter your email"
          defaultValue="invalid-email"
        />
        <Message intent="danger" size="sm">
          Please enter a valid email address.
        </Message>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password-input" className="font-medium text-sm">
          Password
        </label>
        <input
          id="password-input"
          type="password"
          className="rounded-md border border-border-success bg-bg-normal px-3 py-2 text-sm"
          placeholder="Enter your password"
          defaultValue="securepassword123"
        />
        <Message intent="success" size="sm">
          Password meets all requirements.
        </Message>
      </div>
    </div>
  ),
};

export const GitHubStyleAlert: Story = {
  decorators: [
    (Story) => (
      <div className="w-125">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-3">
      <Message intent="neutral" icon={<InfoIcon />}>
        <MessageBody>
          <MessageTitle>Note</MessageTitle>
          <MessageDescription>Useful information that users should know, even when skimming content.</MessageDescription>
        </MessageBody>
      </Message>

      <Message intent="success" icon={<CheckIcon />}>
        <MessageBody>
          <MessageTitle>Tip</MessageTitle>
          <MessageDescription>Helpful advice for doing things better or more easily.</MessageDescription>
        </MessageBody>
      </Message>

      <Message intent="warning" icon={<AlertIcon />}>
        <MessageBody>
          <MessageTitle>Warning</MessageTitle>
          <MessageDescription>Urgent info that needs immediate user attention to avoid problems.</MessageDescription>
        </MessageBody>
      </Message>

      <Message intent="danger" icon={<ErrorIcon />}>
        <MessageBody>
          <MessageTitle>Caution</MessageTitle>
          <MessageDescription>Advises about risks or negative outcomes of certain actions.</MessageDescription>
        </MessageBody>
      </Message>
    </div>
  ),
};

export const ComponentTokens = componentTokensStory("message");
