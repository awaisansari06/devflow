import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
                <SkeletonText className="w-1/3 h-5" />
                <Skeleton className="size-8 rounded-full" />
            </div>
            <SkeletonText className="w-full" />
            <SkeletonText className="w-2/3" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function ProjectListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    );
}
