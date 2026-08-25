/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagChip } from "./TagChip";

describe("TagChip", () => {
  it("renders a namespaced tag with the namespace and value split", () => {
    render(<TagChip tag="project:website" />);
    expect(screen.getByText("project:")).toBeInTheDocument();
    expect(screen.getByText("website")).toBeInTheDocument();
  });

  it("renders a plain tag verbatim", () => {
    render(<TagChip tag="urgent" />);
    expect(screen.getByText("urgent")).toBeInTheDocument();
  });

  it("shows no remove affordance by default (navigable mode)", () => {
    render(<TagChip tag="urgent" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a remove button that fires onRemove", () => {
    const onRemove = vi.fn();
    render(<TagChip tag="urgent" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove urgent" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
