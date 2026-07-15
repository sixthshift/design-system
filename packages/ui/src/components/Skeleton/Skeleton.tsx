import { cn } from "@sixthshift/ui/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("animate-pulse rounded-md bg-bg-strong/10", className)} {...props} />;
};

export { Skeleton };
