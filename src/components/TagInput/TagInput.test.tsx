/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TagInput } from "./TagInput";

const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });

describe("TagInput", () => {
  it("renders existing tags as chips", () => {
    render(<TagInput value={["urgent", "project:q1"]} onValueChange={vi.fn()} />);
    expect(screen.getByText("urgent")).toBeInTheDocument();
    expect(screen.getByText("project:")).toBeInTheDocument();
  });

  it("commits a trimmed tag on Enter", () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onValueChange={onChange} placeholder="Add a tag" />);
    const input = screen.getByPlaceholderText("Add a tag");
    type(input, "  focus  ");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["focus"]);
  });

  it("commits on comma", () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onValueChange={onChange} placeholder="Add a tag" />);
    const input = screen.getByPlaceholderText("Add a tag");
    type(input, "work");
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["work"]);
  });

  it("ignores a duplicate tag", () => {
    const onChange = vi.fn();
    render(<TagInput value={["work"]} onValueChange={onChange} />);
    const input = screen.getByRole("textbox");
    type(input, "work");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes the last tag on Backspace when the field is empty", () => {
    const onChange = vi.fn();
    render(<TagInput value={["a", "b"]} onValueChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("removes a tag via its chip's × button", () => {
    const onChange = vi.fn();
    render(<TagInput value={["a", "b"]} onValueChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove a" }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("forwards ref", () => {
    const ref = vi.fn();
    render(<TagInput value={[]} onValueChange={vi.fn()} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe("form integration", () => {
  it("mirrors each tag into a name[] hidden input when name is set", () => {
    const { container } = render(<TagInput value={["urgent", "q1"]} onValueChange={vi.fn()} name="tags" />);
    const hidden = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="hidden"]'));
    expect(hidden.map((input) => input.name)).toEqual(["tags[]", "tags[]"]);
    expect(hidden.map((input) => input.value)).toEqual(["urgent", "q1"]);
  });

  it("renders no hidden inputs without a name", () => {
    const { container } = render(<TagInput value={["urgent"]} onValueChange={vi.fn()} />);
    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
  });

  it("stamps form onto the hidden inputs", () => {
    const { container } = render(<TagInput value={["urgent"]} onValueChange={vi.fn()} name="tags" form="filters" />);
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute("form", "filters");
  });
});
