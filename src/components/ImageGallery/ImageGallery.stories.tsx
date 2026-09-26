import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { componentTokensStory } from "../../stories/component-tokens/componentTokensStory";
import { ImageGallery, type ImageGalleryImage } from "./ImageGallery";

/**
 * Inline SVG photos, so the stories need no network and the screenshots have
 * nothing to wait on. The colours are content, not UI — they stand in for
 * photography and deliberately do not follow the theme.
 */
function photo(label: string, from: string, to: string): ImageGalleryImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><circle cx="400" cy="430" r="210" fill="#ffffff" fill-opacity="0.35"/><text x="400" y="450" font-family="sans-serif" font-size="64" text-anchor="middle" fill="#ffffff">${label}</text></svg>`;
  return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: `${label} view of the product` };
}

const PHOTOS: ImageGalleryImage[] = [
  photo("Front", "#e8a0b4", "#b8577a"),
  photo("Side", "#f2c38b", "#c9803a"),
  photo("Top", "#a8c6a0", "#5f8a55"),
  photo("Detail", "#9fb7dc", "#4d6fa8"),
  photo("Box", "#c7b3dd", "#7c5ba6"),
];

const meta: Meta<typeof ImageGallery> = {
  title: "Components/ImageGallery",
  component: ImageGallery,
  parameters: {
    layout: "centered",
    docs: { subtitle: "A swipeable product photo carousel with thumbnails or dots" },
  },
  tags: ["autodocs"],
  args: { images: PHOTOS, label: "Product photos" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

/**
 * Next, a thumbnail and the arrow keys all move the same index, and the
 * previous button disables on the first image.
 *
 * Runs where there is real layout, so the scroll position is checked too — the
 * part a simulated DOM cannot show.
 */
export const NavigatePlay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumbs = canvas.getAllByRole("button", { name: /^Show image/ });
    const slides = canvas.getAllByRole("group", { hidden: true });
    const track = slides[0]!.parentElement!;

    await expect(canvas.getByRole("button", { name: "Previous image" })).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
    await expect(thumbs[1]).toHaveAttribute("aria-current", "true");

    await userEvent.click(thumbs[3]!);
    await expect(slides[3]).toHaveAttribute("aria-hidden", "false");
    await waitFor(() => expect(Math.round(track.scrollLeft / track.clientWidth)).toBe(3));

    track.focus();
    await userEvent.keyboard("{Home}");
    await expect(thumbs[0]).toHaveAttribute("aria-current", "true");
  },
};

export const Default: Story = {};

/** Every frame shape, with the indicator each suits: dots for compact cards, thumbnails for a product page. */
export const AllRatios: Story = {
  decorators: [
    (Story) => (
      <div className="w-[42rem]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-4 items-start gap-4">
      <ImageGallery label="Square" images={PHOTOS} ratio="square" indicator="dots" />
      <ImageGallery label="Portrait" images={PHOTOS} ratio="portrait" indicator="dots" />
      <ImageGallery label="Landscape" images={PHOTOS} ratio="landscape" indicator="thumbnails" />
      <ImageGallery label="Wide" images={PHOTOS} ratio="wide" indicator="none" />
    </div>
  ),
};

/** One image drops the controls and indicator; none shows the placeholder. */
export const EdgeCases: Story = {
  decorators: [
    (Story) => (
      <div className="w-[40rem]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 items-start gap-6">
      <ImageGallery label="One photo" images={PHOTOS.slice(0, 1)} />
      <ImageGallery label="No photos" images={[]} placeholder="No photos yet" />
    </div>
  ),
};

export const Dots: Story = {
  args: { indicator: "dots", ratio: "portrait" },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [index, setIndex] = useState(2);
    return (
      <div className="flex flex-col gap-3">
        <ImageGallery label="Product photos" images={PHOTOS} index={index} onIndexChange={setIndex} />
        <p className="text-center text-fg-subtle text-sm">
          Showing {index + 1} of {PHOTOS.length}
        </p>
      </div>
    );
  },
};

export const ComponentTokens = componentTokensStory("image-gallery", "image-gallery-thumb", "image-gallery-dot");
