"use client";

import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { ProjectsList } from "./projects-list";
import { ProjectsListSkeleton } from "./projects-list-skeleton";
import { useQuery } from "@tanstack/react-query";

export function ProjectsSection() {
    const { data: projects, isLoading } = useQuery(useTRPC().projects.getMany.queryOptions());
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setHasLoadedOnce(true);
        }
    }, [isLoading]);

    // Skeleton only on FIRST load
    if (isLoading && !hasLoadedOnce) {
        return <ProjectsListSkeleton />;
    }

    return (
        <ProjectsList projects={projects || []} />
    );
}
