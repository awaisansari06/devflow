import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function FileTreeSkeleton() {
    return (
        <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${(i % 3) * 12}px` }}
                >
                    <Skeleton className="size-4" />
                    <SkeletonText className="w-32 h-4" />
                </div>
            ))}
        </div>
    );
}

export function CodeViewSkeleton() {
    const widths = ['full', '5/6', '4/5', '3/4'];

    return (
        <div className="p-4 space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
                <SkeletonText
                    key={i}
                    className={`h-4 w-${widths[i % widths.length]}`}
                />
            ))}
        </div>
    );
}
