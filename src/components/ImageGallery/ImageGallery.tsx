"use client";

import { useControllableState } from "@sixthshift/design-system/hooks";
import { cn } from "@sixthshift/design-system/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

/**
 * Geometry only. Every colour reads an `--image-gallery-*` component token
 * whose value is decided by src/components/ImageGallery/image-gallery.recipe.css.
 *
 * `ratio` is the frame's shape, not the images': every slide is cropped to it
 * with `object-cover`, so a mixed set of uploads still produces a steady
 * frame that does not jump as you swipe. `portrait` is 4:5, the tallest crop
 * Instagram allows in a feed — photography shot for the feed lands on it
 * uncropped.
 */
const frameVariants = cva("relative overflow-hidden rounded-lg bg-(--image-gallery-bg)", {
  variants: {
    ratio: {
      square: "aspect-square",
      portrait: "aspect-[4/5]",
      landscape: "aspect-[4/3]",
      wide: "aspect-video",
    },
  },
  defaultVariants: {
    ratio: "square",
  },
});

export type ImageGalleryRatio = NonNullable<VariantProps<typeof frameVariants>["ratio"]>;

export type ImageGalleryImage = {
  src: string;
  /** Required: describe the photo. The gallery adds position ("2 of 5") on its own. */
  alt: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export type ImageGalleryProps = Omit<React.HTMLAttributes<HTMLElement>, "onChange"> &
  VariantProps<typeof frameVariants> & {
    images: readonly ImageGalleryImage[];
    /** Controlled index of the image shown. */
    index?: number;
    /** Initial index in uncontrolled mode. */
    defaultIndex?: number;
    /** Called when the shown image changes — by swipe, arrow, key or thumbnail. */
    onIndexChange?: (index: number) => void;
    /**
     * What sits under the frame: a strip of `thumbnails`, a row of `dots`, or
     * `none`. Only rendered when there is more than one image.
     */
    indicator?: "thumbnails" | "dots" | "none";
    /** Accessible name for the carousel, e.g. the product's name. */
    label?: string;
    /** Accessible name for the previous-image button. */
    previousLabel?: string;
    /** Accessible name for the next-image button. */
    nextLabel?: string;
    /** Shown in the frame when `images` is empty. */
    placeholder?: React.ReactNode;
  };

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/**
 * A product photo carousel: one frame, swipeable on touch, with previous/next
 * buttons, arrow-key navigation and an optional thumbnail strip or dots.
 *
 * Swiping is native scrolling — a horizontal `scroll-snap` track, not a
 * pointer-event reimplementation — so it has the platform's own momentum and
 * edge behaviour on phones. The shown index follows the scroll position, and
 * setting the index (by button, key, thumbnail or a controlled `index`)
 * scrolls the track. Both directions meet at one rule: the effect only scrolls
 * when the track is not already showing the index, so a swipe that updates
 * the index never fights itself.
 *
 * Controlled or uncontrolled through `index`/`defaultIndex`/`onIndexChange`.
 *
 * Follows the WAI-ARIA carousel pattern: the root is a `<section>` with
 * `aria-roledescription="carousel"` (a landmark region once `label` names
 * it), each slide a group named "n of total", and slides out of view are
 * `aria-hidden`. The first image loads eagerly and
 * the rest lazily, so a gallery of ten costs one download up front.
 */
export const ImageGallery = React.forwardRef<HTMLElement, ImageGalleryProps>(
  (
    {
      className,
      images,
      index: controlledIndex,
      defaultIndex = 0,
      onIndexChange,
      ratio = "square",
      indicator = "thumbnails",
      label,
      previousLabel = "Previous image",
      nextLabel = "Next image",
      placeholder,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const count = images.length;
    const [rawIndex, setIndex] = useControllableState({
      value: controlledIndex,
      defaultValue: defaultIndex,
      onChange: onIndexChange,
    });
    const index = count === 0 ? 0 : Math.min(Math.max(rawIndex, 0), count - 1);

    const trackRef = React.useRef<HTMLDivElement | null>(null);
    // The slide a programmatic scroll is heading for. While set, the slides it
    // passes on the way are not reported — jumping from 1 to 4 reports 4, not
    // 2, 3 and 4. Any touch, wheel or pointer on the track hands control back.
    const scrollTargetRef = React.useRef<number | null>(null);

    // Index → scroll. Skipped when the track already shows `index`, which is
    // always the case right after a swipe reported it.
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      if (Math.round(track.scrollLeft / track.clientWidth) === index) return;
      scrollTargetRef.current = index;
      track.scrollTo({ left: index * track.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }, [index]);

    // Scroll → index. Rounds, so the index flips at the halfway point of a swipe.
    const handleScroll = () => {
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      const shown = Math.round(track.scrollLeft / track.clientWidth);
      if (scrollTargetRef.current !== null) {
        if (shown !== scrollTargetRef.current) return;
        scrollTargetRef.current = null;
      }
      if (shown !== index && shown >= 0 && shown < count) setIndex(shown);
    };

    const releaseScroll = () => {
      scrollTargetRef.current = null;
    };

    const go = (next: number) => {
      if (next >= 0 && next < count && next !== index) setIndex(next);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const targets: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: count - 1 };
      const target = targets[event.key];
      if (target === undefined) return;
      event.preventDefault();
      go(target);
    };

    const controlClass =
      "image-gallery-control focus-visible:ring-(color:--image-gallery-control-ring) absolute top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-(--image-gallery-control-bg) text-(--image-gallery-control-fg) shadow transition-opacity hover:bg-(--image-gallery-control-bg-hovered) focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-0 max-sm:hidden [&_svg]:size-5";

    return (
      <section
        ref={ref}
        aria-roledescription="carousel"
        aria-label={label}
        className={cn("image-gallery flex flex-col gap-3", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className={frameVariants({ ratio })}>
          {count === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-(--image-gallery-placeholder-fg) text-sm">{placeholder}</div>
          ) : (
            <div
              ref={trackRef}
              onScroll={handleScroll}
              onPointerDown={releaseScroll}
              onTouchStart={releaseScroll}
              onWheel={releaseScroll}
              // Focusable so the arrow keys work without first reaching a button,
              // and because a scrollable region must be keyboard-reachable.
              // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be focusable (axe `scrollable-region-focusable`)
              tabIndex={0}
              className="focus-visible:ring-(color:--image-gallery-control-ring) flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset [&::-webkit-scrollbar]:hidden"
            >
              {images.map((image, i) => (
                // biome-ignore lint/a11y/useSemanticElements: the WAI-ARIA carousel pattern names each slide a `group`; a <fieldset> is for form controls
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional — "2 of 5" is their identity, and the same photo may appear twice
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={i !== index}
                  className="h-full w-full shrink-0 snap-center snap-always"
                >
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={image.sizes}
                    width={image.width}
                    height={image.height}
                    alt={image.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="h-full w-full select-none object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          {count > 1 && (
            <>
              <button type="button" aria-label={previousLabel} disabled={index === 0} onClick={() => go(index - 1)} className={cn(controlClass, "left-2")}>
                <ChevronLeft aria-hidden="true" />
              </button>
              <button type="button" aria-label={nextLabel} disabled={index === count - 1} onClick={() => go(index + 1)} className={cn(controlClass, "right-2")}>
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {count > 1 && indicator === "thumbnails" && (
          <div className="flex gap-2 overflow-x-auto p-0.5">
            {images.map((image, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional — "2 of 5" is their identity, and the same photo may appear twice
                key={i}
                type="button"
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                data-selected={i === index}
                onClick={() => go(i)}
                className="image-gallery-thumb border-(color:--image-gallery-thumb-border) focus-visible:ring-(color:--image-gallery-control-ring) hover:border-(color:--image-gallery-thumb-border-hovered) size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="64px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {count > 1 && indicator === "dots" && (
          <div className="flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional — "2 of 5" is their identity, and the same photo may appear twice
                key={i}
                type="button"
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                data-selected={i === index}
                onClick={() => go(i)}
                className="image-gallery-dot focus-visible:ring-(color:--image-gallery-control-ring) flex size-6 cursor-pointer items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2"
              >
                <span aria-hidden="true" className="block size-2 rounded-full bg-(--image-gallery-dot-bg) transition-colors" />
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }
);
ImageGallery.displayName = "ImageGallery";

export { frameVariants as imageGalleryFrameVariants };
