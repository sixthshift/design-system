/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { TabItem } from "./components/TabsContext";
import { Tabs } from "./Tabs";

const items: TabItem[] = [
  { value: "details", label: "My details", content: <p>Details content here</p> },
  { value: "profile", label: "Profile", content: <p>Profile content here</p> },
  { value: "password", label: "Password", content: <p>Password content here</p> },
];

const itemsWithDisabled: TabItem[] = [
  { value: "details", label: "My details", content: <p>Details content</p> },
  { value: "profile", label: "Profile", content: <p>Profile content</p> },
  { value: "settings", label: "Settings", disabled: true, content: <p>Settings content</p> },
  { value: "billing", label: "Billing", content: <p>Billing content</p> },
];

describe("Tabs", () => {
  describe("rendering", () => {
    it("renders a tablist", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("renders a tab for each item", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tab", { name: "My details" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Profile" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Password" })).toBeInTheDocument();
    });

    it("renders only the active panel", () => {
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
      expect(screen.getByText("Profile content here")).toBeInTheDocument();
      expect(screen.queryByText("Details content here")).not.toBeInTheDocument();
      expect(screen.queryByText("Password content here")).not.toBeInTheDocument();
    });

    it("defaults to the first item when no defaultValue is given", () => {
      render(
        <Tabs items={items}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByText("Details content here")).toBeInTheDocument();
    });

    it("defaults to the first non-disabled item when the first item is disabled", () => {
      const disabledFirst: TabItem[] = [
        { value: "settings", label: "Settings", disabled: true, content: <p>Settings content</p> },
        { value: "billing", label: "Billing", content: <p>Billing content</p> },
      ];
      render(
        <Tabs items={disabledFirst}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByText("Billing content")).toBeInTheDocument();
    });

    it("renders a badge when the item has one", () => {
      const withBadge: TabItem[] = [
        { value: "activity", label: "Activity", badge: 5, content: <p>Activity content</p> },
        { value: "other", label: "Other", content: <p>Other content</p> },
      ];
      render(
        <Tabs items={withBadge} defaultValue="activity">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("supports lazy content functions, invoked only when the tab is active", () => {
      const lazyContent = vi.fn(() => <p>Lazy content rendered</p>);
      const lazyItems: TabItem[] = [
        { value: "eager", label: "Eager", content: <p>Eager content</p> },
        { value: "lazy", label: "Lazy", content: lazyContent },
      ];
      render(
        <Tabs items={lazyItems} defaultValue="eager">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(lazyContent).not.toHaveBeenCalled();
      expect(screen.getByText("Eager content")).toBeInTheDocument();
    });
  });

  describe("ARIA wiring", () => {
    it("marks the active tab as selected and others as not selected", () => {
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: "My details" })).toHaveAttribute("aria-selected", "false");
      expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "false");
    });

    it("wires aria-controls on the active tab to the rendered panel's id", () => {
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      const activeTab = screen.getByRole("tab", { name: "Profile" });
      const panel = screen.getByRole("tabpanel");
      expect(activeTab).toHaveAttribute("aria-controls", panel.id);
    });

    it("wires aria-labelledby on the panel to the active tab's id", () => {
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      const activeTab = screen.getByRole("tab", { name: "Profile" });
      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveAttribute("aria-labelledby", activeTab.id);
    });

    it("only gives the selected tab a 0 tabIndex, others get -1", () => {
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("tabIndex", "0");
      expect(screen.getByRole("tab", { name: "My details" })).toHaveAttribute("tabIndex", "-1");
      expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("tabIndex", "-1");
    });

    it("sets aria-orientation on the tablist", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List orientation="vertical" />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    });

    it("defaults orientation to horizontal", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
    });
  });

  describe("selection via click", () => {
    it("switches the active panel when a tab is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "Password" }));

      expect(screen.getByText("Password content here")).toBeInTheDocument();
      expect(screen.queryByText("Details content here")).not.toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute("aria-selected", "true");
    });

    it("calls onValueChange when a tab is clicked", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Tabs items={items} defaultValue="details" onValueChange={handleChange}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "Profile" }));
      expect(handleChange).toHaveBeenCalledWith("profile");
    });
  });

  describe("disabled tabs", () => {
    it("marks a disabled tab with the disabled attribute", () => {
      render(
        <Tabs items={itemsWithDisabled} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tab", { name: "Settings" })).toBeDisabled();
    });

    it("does not switch panels when a disabled tab is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={itemsWithDisabled} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "Settings" }));
      expect(screen.getByText("Details content")).toBeInTheDocument();
    });
  });

  describe("controlled vs uncontrolled", () => {
    it("manages its own state when uncontrolled", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "Profile" }));
      expect(screen.getByText("Profile content here")).toBeInTheDocument();
    });

    it("is driven entirely by the value prop when controlled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Tabs items={items} value="profile" onValueChange={handleChange}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      await user.click(screen.getByRole("tab", { name: "My details" }));

      // The consumer is notified, but the displayed panel does not change
      // because the parent did not update the `value` prop.
      expect(handleChange).toHaveBeenCalledWith("details");
      expect(screen.getByText("Profile content here")).toBeInTheDocument();
    });

    it("updates the active panel when the controlled value prop changes", () => {
      const { rerender } = render(
        <Tabs items={items} value="details" onValueChange={() => {}}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByText("Details content here")).toBeInTheDocument();

      rerender(
        <Tabs items={items} value="password" onValueChange={() => {}}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByText("Password content here")).toBeInTheDocument();
    });
  });

  describe("keyboard behavior", () => {
    it("moves selection to the next tab with ArrowRight", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "My details" }).focus();
      await user.keyboard("{ArrowRight}");

      expect(screen.getByRole("tab", { name: "Profile" })).toHaveFocus();
      expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true");
    });

    it("moves selection to the previous tab with ArrowLeft", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "Profile" }).focus();
      await user.keyboard("{ArrowLeft}");

      expect(screen.getByRole("tab", { name: "My details" })).toHaveFocus();
      expect(screen.getByRole("tab", { name: "My details" })).toHaveAttribute("aria-selected", "true");
    });

    it("wraps from the last tab to the first with ArrowRight", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="password">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "Password" }).focus();
      await user.keyboard("{ArrowRight}");

      expect(screen.getByRole("tab", { name: "My details" })).toHaveFocus();
    });

    it("wraps from the first tab to the last with ArrowLeft", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "My details" }).focus();
      await user.keyboard("{ArrowLeft}");

      expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    });

    it("uses ArrowDown/ArrowUp when orientation is vertical", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List orientation="vertical" />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "My details" }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("tab", { name: "Profile" })).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("tab", { name: "My details" })).toHaveFocus();
    });

    it("jumps to the first tab with Home", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="password">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "Password" }).focus();
      await user.keyboard("{Home}");

      expect(screen.getByRole("tab", { name: "My details" })).toHaveFocus();
    });

    it("jumps to the last tab with End", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "My details" }).focus();
      await user.keyboard("{End}");

      expect(screen.getByRole("tab", { name: "Password" })).toHaveFocus();
    });

    it("skips disabled tabs when navigating with arrow keys", async () => {
      const user = userEvent.setup();
      render(
        <Tabs items={itemsWithDisabled} defaultValue="profile">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "Profile" }).focus();
      await user.keyboard("{ArrowRight}");

      // Settings is disabled, so focus should skip it and land on Billing
      expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
    });

    it("calls onValueChange when navigating with arrow keys", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Tabs items={items} defaultValue="details" onValueChange={handleChange}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "My details" }).focus();
      await user.keyboard("{ArrowRight}");

      expect(handleChange).toHaveBeenCalledWith("profile");
    });
  });

  describe("className merging", () => {
    it("merges custom className on Tabs.List", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List className="custom-list" />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tablist")).toHaveClass("custom-list");
    });

    it("merges custom className on Tabs.Panels", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels className="custom-panel" />
        </Tabs>
      );
      expect(screen.getByRole("tabpanel")).toHaveClass("custom-panel");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref on Tabs.List", () => {
      const ref = vi.fn();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List ref={ref} />
          <Tabs.Panels />
        </Tabs>
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it("forwards ref on Tabs.Panels", () => {
      const ref = vi.fn();
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels ref={ref} />
        </Tabs>
      );
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("edge cases", () => {
    it("renders without error when there is a single tab", () => {
      const singleItem: TabItem[] = [{ value: "only", label: "Only tab", content: <p>Only content</p> }];
      render(
        <Tabs items={singleItem} defaultValue="only">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tab", { name: "Only tab" })).toBeInTheDocument();
      expect(screen.getByText("Only content")).toBeInTheDocument();
    });

    it("keeps focus on the only tab when pressing ArrowRight with a single tab", async () => {
      const user = userEvent.setup();
      const singleItem: TabItem[] = [{ value: "only", label: "Only tab", content: <p>Only content</p> }];
      render(
        <Tabs items={singleItem} defaultValue="only">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      screen.getByRole("tab", { name: "Only tab" }).focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: "Only tab" })).toHaveFocus();
    });

    it("renders no tabs and no panel when items is empty", () => {
      render(
        <Tabs items={[]}>
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );
      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
    });
  });

  describe("aria-controls integrity", () => {
    it("only sets aria-controls on the selected tab, since other panels are not mounted", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");
      const selected = tabs.find((tab) => tab.getAttribute("aria-selected") === "true");
      const unselected = tabs.filter((tab) => tab.getAttribute("aria-selected") !== "true");

      expect(selected).toHaveAttribute("aria-controls");
      for (const tab of unselected) {
        expect(tab).not.toHaveAttribute("aria-controls");
      }
    });

    it("every aria-controls reference points at an element in the document", () => {
      render(
        <Tabs items={items} defaultValue="details">
          <Tabs.List />
          <Tabs.Panels />
        </Tabs>
      );

      for (const tab of screen.getAllByRole("tab")) {
        const id = tab.getAttribute("aria-controls");
        if (id) expect(document.getElementById(id)).not.toBeNull();
      }
    });
  });
});
