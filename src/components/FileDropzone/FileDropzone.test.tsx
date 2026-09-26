/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FileDropzone } from "./FileDropzone";

function file(name: string, type: string, size = 10) {
  return new File(["x".repeat(size)], name, { type });
}

function drop(target: HTMLElement, files: File[]) {
  fireEvent.drop(target, { dataTransfer: { files, types: ["Files"] } });
}

describe("FileDropzone", () => {
  describe("rendering", () => {
    it("is a button named by its label and described by its hint", () => {
      render(<FileDropzone onFilesChange={vi.fn()} label="Add photos" hint="Images only" />);
      const zone = screen.getByRole("button", { name: "Add photos" });
      expect(zone).toHaveAccessibleDescription("Images only");
      expect(zone).toHaveAttribute("data-state", "idle");
      expect(zone).toHaveClass("file-dropzone");
    });

    it("forwards ref and merges className", () => {
      const ref = vi.fn();
      render(<FileDropzone ref={ref} className="custom" onFilesChange={vi.fn()} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
      expect(screen.getByRole("button")).toHaveClass("file-dropzone", "custom");
    });

    it("passes accept, multiple and name to the native input", () => {
      const { container } = render(<FileDropzone onFilesChange={vi.fn()} accept="image/*" multiple name="photos" />);
      const input = container.querySelector("input[type=file]");
      expect(input).toHaveAttribute("accept", "image/*");
      expect(input).toHaveAttribute("multiple");
      expect(input).toHaveAttribute("name", "photos");
    });

    it("leaves the tab order when disabled", () => {
      render(<FileDropzone onFilesChange={vi.fn()} disabled />);
      const zone = screen.getByRole("button");
      expect(zone).toHaveAttribute("tabindex", "-1");
      expect(zone).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("picking", () => {
    it("reports files chosen in the picker", async () => {
      const user = userEvent.setup();
      const onFilesChange = vi.fn();
      const { container } = render(<FileDropzone onFilesChange={onFilesChange} />);
      const input = container.querySelector("input[type=file]") as HTMLInputElement;
      const photo = file("cake.png", "image/png");
      await user.upload(input, photo);
      expect(onFilesChange).toHaveBeenCalledWith([photo]);
    });

    it("opens the picker on Enter and Space", async () => {
      const user = userEvent.setup();
      const { container } = render(<FileDropzone onFilesChange={vi.fn()} />);
      const input = container.querySelector("input[type=file]") as HTMLInputElement;
      const click = vi.spyOn(input, "click");
      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");
      await user.keyboard(" ");
      expect(click).toHaveBeenCalledTimes(2);
    });
  });

  describe("dropping", () => {
    it("shows the active state while dragging and reports dropped files", () => {
      const onFilesChange = vi.fn();
      render(<FileDropzone onFilesChange={onFilesChange} />);
      const zone = screen.getByRole("button");
      fireEvent.dragEnter(zone, { dataTransfer: { files: [], types: ["Files"] } });
      expect(zone).toHaveAttribute("data-state", "active");
      const photo = file("cake.png", "image/png");
      drop(zone, [photo]);
      expect(zone).toHaveAttribute("data-state", "idle");
      expect(onFilesChange).toHaveBeenCalledWith([photo]);
    });

    it("keeps only the first file without multiple", () => {
      const onFilesChange = vi.fn();
      render(<FileDropzone onFilesChange={onFilesChange} />);
      const a = file("a.png", "image/png");
      drop(screen.getByRole("button"), [a, file("b.png", "image/png")]);
      expect(onFilesChange).toHaveBeenCalledWith([a]);
    });

    it("rejects files outside accept or over maxSize", () => {
      const onFilesChange = vi.fn();
      const onFilesRejected = vi.fn();
      render(<FileDropzone onFilesChange={onFilesChange} onFilesRejected={onFilesRejected} accept="image/*,.pdf" maxSize={100} multiple />);
      const ok = file("ok.png", "image/png");
      const pdf = file("menu.pdf", "application/pdf");
      const text = file("notes.txt", "text/plain");
      const big = file("big.png", "image/png", 200);
      drop(screen.getByRole("button"), [ok, pdf, text, big]);
      expect(onFilesChange).toHaveBeenCalledWith([ok, pdf]);
      expect(onFilesRejected).toHaveBeenCalledWith([
        { file: text, reason: "type" },
        { file: big, reason: "size" },
      ]);
    });

    it("ignores drops while pending or disabled", () => {
      const onFilesChange = vi.fn();
      const { rerender } = render(<FileDropzone onFilesChange={onFilesChange} pending />);
      drop(screen.getByRole("button"), [file("a.png", "image/png")]);
      rerender(<FileDropzone onFilesChange={onFilesChange} disabled />);
      drop(screen.getByRole("button"), [file("a.png", "image/png")]);
      expect(onFilesChange).not.toHaveBeenCalled();
    });
  });
});
