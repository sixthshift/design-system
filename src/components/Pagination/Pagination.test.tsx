/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  describe("rendering", () => {
    it("renders the rows-per-page label", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByText("Rows per page")).toBeInTheDocument();
    });

    it("renders a custom rows label", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} rowsLabel="Items per page" />);
      expect(screen.getByText("Items per page")).toBeInTheDocument();
      expect(screen.queryByText("Rows per page")).not.toBeInTheDocument();
    });

    it("renders the page size selector showing the current page size", () => {
      render(<Pagination page={0} pageSize={25} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "25" })).toBeInTheDocument();
    });

    it("renders previous and next navigation buttons", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
    });

    it("spreads additional props onto the root element", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} data-testid="custom-pagination" />);
      expect(screen.getByTestId("custom-pagination")).toBeInTheDocument();
    });

    it("forwards ref to the root element", () => {
      const ref = vi.fn();
      render(<Pagination ref={ref} page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });
  });

  describe("results range arithmetic", () => {
    // The page-size selector trigger also renders the numeric page size as text,
    // so we assert against the full rendered text content rather than individual
    // getByText queries, which could otherwise match either element ambiguously.

    it("shows 1-10 of 100 on the first page", () => {
      const { container } = render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(container.textContent).toContain("1-10 of 100");
    });

    it("shows 11-20 of 100 on the second page", () => {
      const { container } = render(<Pagination page={1} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(container.textContent).toContain("11-20 of 100");
    });

    it("clamps the end of the range to total on the last (partial) page", () => {
      // Page index 2 (third page) of size 10, total 25 -> items 21-25
      const { container } = render(<Pagination page={2} pageSize={10} total={25} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(container.textContent).toContain("21-25 of 25");
    });

    it("shows the full range on a single page when total fits within pageSize", () => {
      const { container } = render(<Pagination page={0} pageSize={50} total={25} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(container.textContent).toContain("1-25 of 25");
    });

    it('shows "No results" when total is 0', () => {
      render(<Pagination page={0} pageSize={10} total={0} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByText("No results")).toBeInTheDocument();
    });

    it("computes correct range for large datasets with many pages", () => {
      // Page index 49 of size 10, total 1000 -> items 491-500
      const { container } = render(<Pagination page={49} pageSize={10} total={1000} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(container.textContent).toContain("491-500 of 1000");
    });
  });

  describe("navigation button boundary states", () => {
    it("disables the previous button on the first page", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    });

    it("enables the previous button when not on the first page", () => {
      render(<Pagination page={1} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
    });

    it("disables the next button on the last page", () => {
      // 100 items, pageSize 10 -> 10 pages, last page index = 9
      render(<Pagination page={9} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });

    it("enables the next button when not on the last page", () => {
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
    });

    it("disables both buttons when everything fits on a single page", () => {
      render(<Pagination page={0} pageSize={50} total={25} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });

    it("disables both buttons when there are no results", () => {
      render(<Pagination page={0} pageSize={10} total={0} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });

    it.each([
      [0, true, false],
      [1, false, true],
    ] as const)("with two pages, page %i has prev disabled=%s and next disabled=%s", (page, prevDisabled, nextDisabled) => {
      render(<Pagination page={page} pageSize={10} total={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      const prevButton = screen.getByRole("button", { name: "Previous page" });
      const nextButton = screen.getByRole("button", { name: "Next page" });
      expect(prevButton.hasAttribute("disabled")).toBe(prevDisabled);
      expect(nextButton.hasAttribute("disabled")).toBe(nextDisabled);
    });

    it("enables both buttons on a middle page of a large dataset", () => {
      render(<Pagination page={5} pageSize={10} total={1000} onPageChange={() => {}} onPageSizeChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
    });
  });

  describe("navigation interaction", () => {
    it("calls onPageChange with page - 1 when previous is clicked", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      render(<Pagination page={3} pageSize={10} total={100} onPageChange={handlePageChange} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Previous page" }));
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange with page + 1 when next is clicked", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      render(<Pagination page={3} pageSize={10} total={100} onPageChange={handlePageChange} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Next page" }));
      expect(handlePageChange).toHaveBeenCalledWith(4);
    });

    it("does not call onPageChange when clicking a disabled previous button", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={handlePageChange} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Previous page" }));
      expect(handlePageChange).not.toHaveBeenCalled();
    });

    it("does not call onPageChange when clicking a disabled next button", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      render(<Pagination page={9} pageSize={10} total={100} onPageChange={handlePageChange} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Next page" }));
      expect(handlePageChange).not.toHaveBeenCalled();
    });
  });

  describe("page size selector", () => {
    it("lists the default page size options", async () => {
      const user = userEvent.setup();
      render(<Pagination page={0} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "10" }));
      expect(screen.getByRole("option", { name: "10" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "25" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "50" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "100" })).toBeInTheDocument();
    });

    it("supports custom page size options", async () => {
      const user = userEvent.setup();
      render(<Pagination page={0} pageSize={5} total={100} onPageChange={() => {}} onPageSizeChange={() => {}} pageSizeOptions={[5, 15]} />);

      await user.click(screen.getByRole("button", { name: "5" }));
      expect(screen.getByRole("option", { name: "5" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "15" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "10" })).not.toBeInTheDocument();
    });

    it("calls onPageSizeChange with the numeric page size when a new size is selected", async () => {
      const user = userEvent.setup();
      const handlePageSizeChange = vi.fn();
      render(<Pagination page={2} pageSize={10} total={100} onPageChange={() => {}} onPageSizeChange={handlePageSizeChange} />);

      await user.click(screen.getByRole("button", { name: "10" }));
      await user.click(screen.getByRole("option", { name: "50" }));

      expect(handlePageSizeChange).toHaveBeenCalledWith(50);
    });

    it("resets the page to 0 when the page size is changed", async () => {
      const user = userEvent.setup();
      const handlePageChange = vi.fn();
      render(<Pagination page={2} pageSize={10} total={100} onPageChange={handlePageChange} onPageSizeChange={() => {}} />);

      await user.click(screen.getByRole("button", { name: "10" }));
      await user.click(screen.getByRole("option", { name: "50" }));

      expect(handlePageChange).toHaveBeenCalledWith(0);
    });
  });

  describe("className merging", () => {
    it("merges custom className with default classes", () => {
      render(
        <Pagination
          page={0}
          pageSize={10}
          total={100}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          className="custom-class"
          data-testid="pagination-root"
        />
      );
      const root = screen.getByTestId("pagination-root");
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex");
    });
  });
});
