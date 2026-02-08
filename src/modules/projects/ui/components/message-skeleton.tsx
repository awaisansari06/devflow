import { Skeleton, SkeletonText, SkeletonCircle } from "@/components/ui/skeleton";

export function MessageSkeleton() {
    return (
        <div className="flex gap-3 p-4 border-b">
            <SkeletonCircle className="size-8 shrink-0" />
            <div className="flex-1 space-y-2">
                <SkeletonText className="w-3/4" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-5/6" />
            </div>
        </div>
    );
}

export function MessageListSkeleton() {
    return (
        <div className="space-y-0">
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
        </div>
    );
}
