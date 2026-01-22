import {
    MotionDiv,
    itemVariants,
    pageVariants,
} from "@/components/motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowUpDown, FolderOpen, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MotionGlowCard } from "@/components/motion-glow-card";

type Project = {
    id: string;
    name: string;
    createdAtLabel?: string;
    updatedAt: number | Date;
    isFavorite: boolean;
    createdAt: Date;
};

type TabKey = "recent" | "favorites" | "all";
type SortKey = "updated" | "name";

interface Props {
    projects: Project[];
}

export function ProjectsList({ projects }: Props) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const toggleFavorite = useMutation(trpc.projects.toggleFavorite.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.projects.getMany.queryKey() });
        },
        onError: (error) => {
            console.error("Failed to toggle favorite:", error);
        }
    }));

    const [tab, setTab] = useState<TabKey>("recent");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("updated");

    const mappedProjects = useMemo(() => {
        return projects.map(p => ({
            ...p,
            createdAtLabel: formatDistanceToNow(p.createdAt, { addSuffix: true }),
            updatedAtMs: typeof p.updatedAt === 'string' ? new Date(p.updatedAt).getTime() : p.updatedAt instanceof Date ? p.updatedAt.getTime() : p.updatedAt,
        }));
    }, [projects]);


    const filtered = useMemo(() => {
        let list = [...mappedProjects];

        // Tabs
        if (tab === "favorites") {
            list = list.filter((p) => p.isFavorite);
        }

        // Search
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q));
        }

        // Sort
        if (sort === "name") {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
        }

        // Recent tab (top 6 like a dashboard)
        if (tab === "recent") {
            list = list.slice(0, 6);
        }

        return list;
    }, [mappedProjects, tab, query, sort]);

    const handleNewProject = () => {
        const input = document.querySelector('textarea');
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const hasProjects = projects.length > 0;
    const hasResults = filtered.length > 0;

    return (
        <section className="w-full max-w-5xl mx-auto pt-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold tracking-tight">
                        Your Projects ({projects.length})
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Jump back in where you left off
                    </p>
                </div>

                <Button className="rounded-xl w-full md:w-auto" onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New project
                </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                {/* Tabs */}
                <div className="flex items-center gap-2 rounded-2xl border bg-background/60 backdrop-blur-md p-1 w-full md:w-auto">
                    {[
                        { key: "recent", label: "Recent" },
                        { key: "favorites", label: "Favorites" },
                        { key: "all", label: "All" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as TabKey)}
                            className={cn(
                                "px-4 py-2 text-sm rounded-xl transition font-medium",
                                tab === t.key
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 rounded-2xl border bg-card/50 backdrop-blur px-3 py-2 w-full">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                </div>

                {/* Sort */}
                <button
                    onClick={() => setSort(sort === "updated" ? "name" : "updated")}
                    className={cn(
                        "rounded-2xl border bg-card/50 backdrop-blur px-4 py-2 text-sm",
                        "hover:bg-card transition flex items-center justify-center gap-2 w-full md:w-auto"
                    )}
                >
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        Sort:{" "}
                        <span className="text-foreground font-medium">
                            {sort === "updated" ? "Updated" : "Name"}
                        </span>
                    </span>
                </button>
            </div>

            {/* Empty state (No projects at all) */}
            {!hasProjects && (
                <div className="rounded-3xl border bg-card/60 backdrop-blur p-10 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl border bg-muted flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold">No projects yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create your first project above to get started.
                    </p>

                    <div className="mt-5 flex justify-center">
                        <Button className="rounded-xl" onClick={handleNewProject}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create project
                        </Button>
                    </div>
                </div>
            )}

            {/* No results from search/filter */}
            {hasProjects && !hasResults && (
                <div className="rounded-3xl border bg-card/50 backdrop-blur p-10 text-center">
                    <h3 className="text-base font-semibold">No matches found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Try searching a different project name.
                    </p>
                </div>
            )}

            {/* Grid */}
            {hasProjects && hasResults && (
                <MotionDiv
                    variants={pageVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {/* New project card - reusing handleNewProject */}
                    <MotionDiv variants={itemVariants}>
                        <MotionGlowCard
                            onClick={handleNewProject}
                            className="cursor-pointer h-full text-left p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-semibold">Create a new project</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Start from a template or your own idea
                                </p>
                            </div>
                        </MotionGlowCard>
                    </MotionDiv>

                    {/* Project cards */}
                    {filtered.map((p) => (
                        <MotionDiv
                            key={p.id}
                            variants={itemVariants}
                        >
                            <MotionGlowCard className="h-full p-5 group relative">
                                <Link
                                    href={`/projects/${p.id}`}
                                    className="absolute inset-0 z-0"
                                />

                                <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
                                    <div className="flex items-center gap-3">
                                        {/* icon */}
                                        <div className="h-11 w-11 rounded-2xl border bg-muted flex items-center justify-center">
                                            <span className="text-sm font-semibold text-foreground/80">
                                                DF
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold leading-tight line-clamp-1">
                                                {p.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {p.createdAtLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite.mutate({ id: p.id });
                                        }}
                                        className={cn(
                                            "h-8 w-8 rounded-xl border flex items-center justify-center transition hover:bg-muted pointer-events-auto cursor-pointer",
                                            p.isFavorite ? "bg-muted border-primary/30" : "bg-transparent border-transparent hover:border-border"
                                        )}
                                    >
                                        <Star
                                            className={cn(
                                                "h-4 w-4 transition-all",
                                                p.isFavorite ? "text-primary fill-primary" : "text-muted-foreground"
                                            )}
                                        />
                                    </button>
                                </div>

                                <div className="relative z-10 mt-4 h-px w-full bg-border/60 pointer-events-none" />

                                <div className="relative z-10 mt-4 flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        Last updated
                                        <span className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 font-medium text-primary">
                                            Open →
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-foreground/80">
                                        {formatDistanceToNow(p.updatedAtMs, { addSuffix: true })}
                                    </span>
                                </div>
                            </MotionGlowCard>
                        </MotionDiv>
                    ))}
                </MotionDiv>
            )}
        </section>
    );
}