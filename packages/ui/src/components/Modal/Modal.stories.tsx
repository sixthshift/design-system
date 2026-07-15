import { Badge } from "@sixthshift/ui/badge";
import { Button } from "@sixthshift/ui/button";
import { Input } from "@sixthshift/ui/input";
import { OverlayProvider, useModal } from "@sixthshift/ui/overlay";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from ".";

const meta: Meta<typeof Modal> = {
  title: "Components/Feedback/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Helper component for stories - wraps modal with trigger button
function ModalDemo({
  children,
  buttonLabel = "Open Modal",
  buttonVariant,
  buttonIntent,
}: {
  children: (props: { onClose: () => void }) => React.ReactNode;
  buttonLabel?: string;
  buttonVariant?: "solid" | "outline" | "ghost" | "link";
  buttonIntent?: "neutral" | "danger";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={buttonVariant} intent={buttonIntent} onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      {open && children({ onClose: () => setOpen(false) })}
    </>
  );
}

export const Default: Story = {
  render: () => (
    <ModalDemo>
      {({ onClose }) => (
        <Modal onOpenChange={onClose}>
          <ModalHeader>
            <h3 className="font-semibold">Confirm Action</h3>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to proceed with this action?</p>
          </ModalBody>
          <ModalFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button intent="danger">Delete</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["sm", "md", "lg", "full"] as const).map((size) => (
        <ModalDemo key={size} buttonLabel={size} buttonVariant="outline">
          {({ onClose }) => (
            <Modal onOpenChange={onClose} size={size}>
              <ModalHeader>
                <h3 className="font-semibold">Size: {size}</h3>
              </ModalHeader>
              <ModalBody>
                <p>
                  This modal uses the <strong>{size}</strong> size variant.
                </p>
              </ModalBody>
              <ModalFooter className="justify-end">
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </Modal>
          )}
        </ModalDemo>
      ))}
    </div>
  ),
};

export const Closable: Story = {
  render: () => (
    <ModalDemo buttonLabel="Open Closable Modal">
      {({ onClose }) => (
        <Modal onOpenChange={onClose} closable>
          <ModalHeader>
            <h3 className="font-semibold">Closable Modal</h3>
          </ModalHeader>
          <ModalBody>
            <p>This modal has a close button in the top-right corner of the header.</p>
          </ModalBody>
          <ModalFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const NonDismissable: Story = {
  render: () => (
    <ModalDemo buttonLabel="Open Non-Dismissable Modal">
      {({ onClose }) => (
        <Modal onOpenChange={onClose} dismissable={false}>
          <ModalHeader>
            <h3 className="font-semibold">Required Action</h3>
          </ModalHeader>
          <ModalBody>
            <p>This modal cannot be dismissed by clicking outside or pressing Escape. You must use the button below.</p>
          </ModalBody>
          <ModalFooter className="justify-end">
            <Button onClick={onClose}>I Understand</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const WithHeaderAction: Story = {
  render: () => (
    <ModalDemo buttonLabel="Open Modal">
      {({ onClose }) => (
        <Modal onOpenChange={onClose}>
          <ModalHeader className="flex-row items-center justify-between">
            <h3 className="font-semibold">Electric Bill</h3>
            <Badge intent="warning">Due Soon</Badge>
          </ModalHeader>
          <ModalBody>
            <div className="font-bold text-2xl">$142.50</div>
            <p className="text-fg-subtle text-sm">Due December 20, 2025</p>
          </ModalBody>
          <ModalFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button intent="success">Mark Paid</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const FormModal: Story = {
  render: () => (
    <ModalDemo buttonLabel="Add New Task">
      {({ onClose }) => (
        <Modal onOpenChange={onClose} size="lg">
          <ModalHeader>
            <h3 className="font-semibold">Create Task</h3>
          </ModalHeader>
          <ModalBody>
            <form
              id="task-form"
              onSubmit={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium text-sm">
                  Title
                </label>
                <Input id="title" placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="font-medium text-sm">
                  Description
                </label>
                <Input id="description" placeholder="Enter description" />
              </div>
            </form>
          </ModalBody>
          <ModalFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="task-form">
              Create Task
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const NoHeader: Story = {
  render: () => (
    <ModalDemo buttonLabel="Open Headerless Modal">
      {({ onClose }) => (
        <Modal onOpenChange={onClose}>
          <ModalBody className="pt-6 text-center">
            <p className="font-semibold text-lg">Custom Content</p>
            <p className="text-fg-subtle">This modal has no header, just body content.</p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const Destructive: Story = {
  render: () => (
    <ModalDemo buttonLabel="Delete Account" buttonIntent="danger">
      {({ onClose }) => (
        <Modal onOpenChange={onClose} size="sm">
          <ModalHeader>
            <h3 className="font-semibold">Delete Account</h3>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <p className="text-sm">This will permanently delete your account and all associated data.</p>
            <p className="text-sm">
              Please type <strong>DELETE</strong> to confirm.
            </p>
            <Input placeholder="Type DELETE" />
          </ModalBody>
          <ModalFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button intent="danger">Delete Forever</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalDemo>
  ),
};

export const LongContent: Story = {
  render: () => {
    const paragraphs = Array.from({ length: 20 }, (_, i) => (
      <p key={i}>
        Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    ));

    return (
      <div className="flex flex-wrap gap-4">
        {(["sm", "md", "lg", "full"] as const).map((size) => (
          <ModalDemo key={size} buttonLabel={`${size} — long`} buttonVariant="outline">
            {({ onClose }) => (
              <Modal onOpenChange={onClose} size={size}>
                <ModalHeader>
                  <h3 className="font-semibold">Long Content ({size})</h3>
                </ModalHeader>
                <ModalBody className="space-y-4">{paragraphs}</ModalBody>
                <ModalFooter className="justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button>Confirm</Button>
                </ModalFooter>
              </Modal>
            )}
          </ModalDemo>
        ))}
      </div>
    );
  },
};

// =============================================================================
// Programmatic Modal (via useModal hook)
// =============================================================================

function UseModalDemo() {
  const { openModal } = useModal();

  const handleOpen = () => {
    openModal(({ onClose }) => (
      <Modal onOpenChange={onClose}>
        <ModalHeader>
          <h3 className="font-semibold">Programmatic Modal</h3>
        </ModalHeader>
        <ModalBody>
          <p>
            This modal was opened using the <code>useModal</code> hook from OverlayContext. It supports stacking multiple modals.
          </p>
        </ModalBody>
        <ModalFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => handleOpenNested()}>Open Nested</Button>
        </ModalFooter>
      </Modal>
    ));
  };

  const handleOpenNested = () => {
    openModal(({ onClose }) => (
      <Modal onOpenChange={onClose} size="sm">
        <ModalHeader>
          <h3 className="font-semibold">Nested Modal</h3>
        </ModalHeader>
        <ModalBody>
          <p>This is a nested modal stacked on top of the first one.</p>
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </Modal>
    ));
  };

  return <Button onClick={handleOpen}>Open via useModal</Button>;
}

export const Programmatic: Story = {
  render: () => (
    <OverlayProvider>
      <UseModalDemo />
    </OverlayProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `useModal` hook from `OverlayContext` to open modals programmatically. This approach supports stacking multiple modals and handles portal rendering automatically.",
      },
    },
  },
};

// =============================================================================
// Stacking Demo
// =============================================================================

function StackingDemo() {
  const { openModal } = useModal();

  const openConfirmation = (action: string) => {
    openModal(({ onClose }) => (
      <Modal onOpenChange={onClose} size="sm">
        <ModalHeader>
          <h3 className="font-semibold">Confirm {action}</h3>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to {action.toLowerCase()}?</p>
        </ModalBody>
        <ModalFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Confirm</Button>
        </ModalFooter>
      </Modal>
    ));
  };

  const handleOpen = () => {
    openModal(({ onClose }) => (
      <Modal onOpenChange={onClose} size="sm">
        <ModalHeader>
          <h3 className="font-semibold">Choose an Action</h3>
        </ModalHeader>
        <ModalBody className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => openConfirmation("Save")}>
            Save Changes
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => openConfirmation("Archive")}>
            Archive Item
          </Button>
          <Button variant="outline" intent="danger" className="w-full justify-start" onClick={() => openConfirmation("Delete")}>
            Delete Item
          </Button>
        </ModalBody>
        <ModalFooter className="justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    ));
  };

  return <Button onClick={handleOpen}>Open Stacking Demo</Button>;
}

export const Stacking: Story = {
  render: () => (
    <OverlayProvider>
      <StackingDemo />
    </OverlayProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "Modals can be stacked when using `useModal`. Each modal opens on top of the previous one, and closing works in LIFO order.",
      },
    },
  },
};
