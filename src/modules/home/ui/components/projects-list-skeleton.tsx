import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsListSkeleton() {
    const delays = [0, 80, 160, 240, 320, 400];

    return (
        <section className="w-full max-w-5xl mx-auto pt-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-36 rounded-lg" delayMs={0} />
                    <Skeleton className="h-4 w-56 rounded-lg" delayMs={80} />
                </div>

                <Skeleton className="h-10 w-full md:w-32 rounded-xl" delayMs={120} />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <Skeleton className="h-11 w-full md:w-[280px] rounded-2xl" delayMs={0} />
                <Skeleton className="h-11 w-full rounded-2xl" delayMs={80} />
                <Skeleton className="h-11 w-full md:w-[190px] rounded-2xl" delayMs={160} />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Create new project skeleton */}
                <div className="rounded-3xl border bg-card/50 backdrop-blur p-5">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-11 w-11 rounded-2xl" delayMs={delays[0]} />
                    </div>

                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-40 rounded-lg" delayMs={delays[1]} />
                        <Skeleton className="h-3 w-48 rounded-lg" delayMs={delays[2]} />
                    </div>
                </div>

                {/* Project cards skeletons */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-3xl border bg-card/50 backdrop-blur p-5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Skeleton
                                    className="h-11 w-11 rounded-2xl"
                                    delayMs={delays[(i + 1) % delays.length]}
                                />
                                <div className="space-y-2">
                                    <Skeleton
                                        className="h-4 w-36 rounded-lg"
                                        delayMs={delays[(i + 2) % delays.length]}
                                    />
                                    <Skeleton
                                        className="h-3 w-24 rounded-lg"
                                        delayMs={delays[(i + 3) % delays.length]}
                                    />
                                </div>
                            </div>

                            <Skeleton
                                className="h-8 w-8 rounded-xl"
                                delayMs={delays[(i + 4) % delays.length]}
                            />
                        </div>

                        <div className="mt-4 h-px w-full bg-border/60" />

                        <div className="mt-4 flex items-center justify-between">
                            <Skeleton
                                className="h-3 w-20 rounded-lg"
                                delayMs={delays[(i + 2) % delays.length]}
                            />
                            <Skeleton
                                className="h-3 w-16 rounded-lg"
                                delayMs={delays[(i + 3) % delays.length]}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
