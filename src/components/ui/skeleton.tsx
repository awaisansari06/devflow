import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  delayMs?: number;
};

export function Skeleton({ className, delayMs = 0, ...props }: Props) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
      {...props}
    />
  );
}
