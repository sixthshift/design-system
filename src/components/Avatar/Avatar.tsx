import { cn } from "@sixthshift/design-system/utils";
import * as React from "react";

/**
 * Circular frame for a user's image, composed from three parts: `Avatar`
 * (the `<span>` frame, 40x40 by default), `AvatarImage` (the `<img>` that
 * fills it), and `AvatarFallback` (a centered `<span>` for initials or an
 * icon, shown when there is no image).
 *
 * There is no swap-on-error wired up between them: `AvatarImage` does not
 * detect a failed load and hide itself, so a consumer decides which of
 * `AvatarImage` or `AvatarFallback` to render — e.g. tracking image-load
 * state itself, or rendering `AvatarFallback` whenever there is no URL yet.
 */
const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, alt, ...props }, ref) => (
  <img ref={ref} alt={alt} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-bg-subtle font-medium text-sm", className)} {...props} />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
