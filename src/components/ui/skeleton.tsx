import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  delayMs?: number;
};

export function Skeleton({ className, delayMs = 0, ...props }: Props) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40 no-theme-transition",
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
      {...props}
    />
  );
}

// Specialized skeleton components
export function SkeletonText({ className, ...props }: Omit<Props, 'delayMs'>) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

export function SkeletonCircle({ className, ...props }: Omit<Props, 'delayMs'>) {
  return <Skeleton className={cn("rounded-full", className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: Omit<Props, 'delayMs'>) {
  return <Skeleton className={cn("h-10 w-24 rounded-lg", className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: Omit<Props, 'delayMs'>) {
  return <Skeleton className={cn("h-32 w-full rounded-lg", className)} {...props} />;
}
