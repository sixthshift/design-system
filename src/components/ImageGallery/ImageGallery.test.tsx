/// <reference types="@testing-library/jest-dom" />
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImageGallery } from "./ImageGallery";

const IMAGES = [
  { src: "/one.jpg", alt: "Strawberry cake, front" },
  { src: "/two.jpg", alt: "Strawberry cake, slice" },
  { src: "/three.jpg", alt: "Strawberry cake, top" },
];

/** happy-dom does no layout, so give the track a width to scroll against. */
const WIDTH = 400;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(WIDTH);
  vi.mocked(Element.prototype.scrollTo).mockClear();
});

function track(): HTMLElement {
  const slide = screen.getAllByRole("group", { hidden: true })[0];
  if (!slide?.parentElement) throw new Error("no track");
  return slide.parentElement;
}

function swipeTo(index: number) {
  const el = track();
  el.scrollLeft = index * WIDTH;
  fireEvent.scroll(el);
}

describe("ImageGallery", () => {
  describe("rendering", () => {
    it("renders a labelled carousel region", () => {
      render(<ImageGallery images={IMAGES} label="Strawberry cake photos" />);
      const region = screen.getByRole("region", { name: "Strawberry cake photos" });
      expect(region).toHaveAttribute("aria-roledescription", "carousel");
    });

    it("forwards ref to the root", () => {
      const ref = vi.fn();
      render(<ImageGallery images={IMAGES} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it("names each slide by position and hides the ones out of view", () => {
      render(<ImageGallery images={IMAGES} />);
      const slides = screen.getAllByRole("group", { hidden: true });
      expect(slides.map((slide) => slide.getAttribute("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
      expect(slides[0]).toHaveAttribute("aria-hidden", "false");
      expect(slides[1]).toHaveAttribute("aria-hidden", "true");
    });

    it("loads the first image eagerly and the rest lazily", () => {
      render(<ImageGallery images={IMAGES} indicator="none" />);
      const [first, second] = screen.getAllByRole("img", { hidden: true });
      expect(first).toHaveAttribute("loading", "eager");
      expect(second).toHaveAttribute("loading", "lazy");
    });

    it("renders the placeholder and no controls when there are no images", () => {
      render(<ImageGallery images={[]} placeholder="No photos yet" />);
      expect(screen.getByText("No photos yet")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders no controls or indicator for a single image", () => {
      render(<ImageGallery images={IMAGES.slice(0, 1)} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("applies the ratio to the frame", () => {
      render(<ImageGallery images={IMAGES} ratio="portrait" />);
      expect(track().parentElement).toHaveClass("aspect-[4/5]");
    });
  });

  describe("indicator", () => {
    it("renders thumbnails by default, marking the shown one", () => {
      render(<ImageGallery images={IMAGES} />);
      const thumbs = screen.getAllByRole("button", { name: /^Show image/ });
      expect(thumbs).toHaveLength(3);
      expect(thumbs[0]).toHaveAttribute("aria-current", "true");
      expect(thumbs[0]).toHaveClass("image-gallery-thumb");
    });

    it("renders dots", () => {
      render(<ImageGallery images={IMAGES} indicator="dots" />);
      expect(screen.getAllByRole("button", { name: /^Show image/ })[0]).toHaveClass("image-gallery-dot");
    });

    it("renders neither with none", () => {
      render(<ImageGallery images={IMAGES} indicator="none" />);
      expect(screen.queryByRole("button", { name: /^Show image/ })).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("moves with the next and previous buttons, disabled at the ends", async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} />);
      const previous = screen.getByRole("button", { name: "Previous image" });
      const next = screen.getByRole("button", { name: "Next image" });

      expect(previous).toBeDisabled();
      await user.click(next);
      expect(onIndexChange).toHaveBeenLastCalledWith(1);
      await user.click(next);
      expect(next).toBeDisabled();
      await user.click(previous);
      expect(onIndexChange).toHaveBeenLastCalledWith(1);
    });

    it("jumps to a thumbnail's image", async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} />);

      await user.click(screen.getByRole("button", { name: "Show image 3 of 3" }));
      expect(onIndexChange).toHaveBeenCalledWith(2);
      expect(screen.getByRole("button", { name: "Show image 3 of 3" })).toHaveAttribute("aria-current", "true");
    });

    it("moves with the arrow keys, Home and End", async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} indicator="none" />);
      track().focus();

      await user.keyboard("{ArrowRight}");
      expect(onIndexChange).toHaveBeenLastCalledWith(1);
      await user.keyboard("{End}");
      expect(onIndexChange).toHaveBeenLastCalledWith(2);
      await user.keyboard("{ArrowRight}");
      expect(onIndexChange).toHaveBeenCalledTimes(2);
      await user.keyboard("{Home}");
      expect(onIndexChange).toHaveBeenLastCalledWith(0);
    });

    it("scrolls the track to the new index", async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={IMAGES} />);

      await user.click(screen.getByRole("button", { name: "Show image 3 of 3" }));
      expect(Element.prototype.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 2 * WIDTH }));
    });
  });

  describe("swiping", () => {
    it("reports the slide scrolled into view without scrolling back", () => {
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} />);

      swipeTo(1);
      expect(onIndexChange).toHaveBeenCalledWith(1);
      expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
    });

    it("does not report the slides a programmatic scroll passes on the way", async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} />);

      await user.click(screen.getByRole("button", { name: "Show image 3 of 3" }));
      onIndexChange.mockClear();
      swipeTo(1); // mid-flight
      expect(onIndexChange).not.toHaveBeenCalled();
      swipeTo(2); // arrived
      expect(onIndexChange).not.toHaveBeenCalled();
    });

    it("hands control back when the user touches the track mid-scroll", async () => {
      const user = userEvent.setup();
      const onIndexChange = vi.fn();
      render(<ImageGallery images={IMAGES} onIndexChange={onIndexChange} />);

      await user.click(screen.getByRole("button", { name: "Show image 3 of 3" }));
      onIndexChange.mockClear();
      fireEvent.touchStart(track());
      swipeTo(1);
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });
  });

  describe("controlled", () => {
    it("follows the index prop", async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [index, setIndex] = useState(1);
        return (
          <>
            <ImageGallery images={IMAGES} index={index} onIndexChange={setIndex} />
            <output>{index}</output>
          </>
        );
      }
      render(<Controlled />);
      expect(screen.getByRole("button", { name: "Show image 2 of 3" })).toHaveAttribute("aria-current", "true");

      await user.click(screen.getByRole("button", { name: "Next image" }));
      expect(screen.getByRole("status")).toHaveTextContent("2");
    });

    it("clamps an index beyond the images", () => {
      render(<ImageGallery images={IMAGES} index={9} onIndexChange={() => {}} />);
      expect(screen.getByRole("button", { name: "Show image 3 of 3" })).toHaveAttribute("aria-current", "true");
    });
  });
});
