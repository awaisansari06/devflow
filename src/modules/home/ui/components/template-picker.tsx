"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    KanbanSquare,
    FolderKanban,
    ShoppingBag,
    Youtube,
    Music,
    Film,
    Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { MotionGlowCard } from "@/components/motion-glow-card";

type Template = {
    id: string;
    title: string;
    subtitle: string;
    prompt: string;
    icon: React.ReactNode;
    tone?: "primary" | "neutral";
};

const templates: Template[] = [
    {
        id: "netflix",
        title: "Netflix Clone",
        subtitle: "Streaming UI + auth",
        prompt: "Build a Netflix clone with landing page, auth, and movie browsing UI.",
        icon: <Film className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "admin",
        title: "Admin Dashboard",
        subtitle: "Charts + tables",
        prompt:
            "Build a modern admin dashboard with sidebar, charts, users table, and settings page.",
        icon: <LayoutDashboard className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "kanban",
        title: "Kanban Board",
        subtitle: "Drag & drop tasks",
        prompt:
            "Build a kanban board with columns, tasks, drag and drop, and task details modal.",
        icon: <KanbanSquare className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "file-manager",
        title: "File Manager",
        subtitle: "Folders + uploads",
        prompt:
            "Build a file manager with folders, upload UI, search, and file preview.",
        icon: <FolderKanban className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "youtube",
        title: "YouTube Clone",
        subtitle: "Feed + video page",
        prompt:
            "Build a YouTube clone with homepage feed, video watch page, and channel page.",
        icon: <Youtube className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "store",
        title: "Store Page",
        subtitle: "Products + cart",
        prompt:
            "Build an e-commerce store page with product grid, product details, and cart UI.",
        icon: <ShoppingBag className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "airbnb",
        title: "Airbnb Clone",
        subtitle: "Listings + filters",
        prompt:
            "Build an Airbnb clone with listing cards, filters, map layout, and details page.",
        icon: <Store className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
    {
        id: "spotify",
        title: "Spotify Clone",
        subtitle: "PlayerS playlist UI",
        prompt:
            "Build a Spotify clone with sidebar, playlists, now playing bar, and album page UI.",
        icon: <Music className="h-4 w-4 text-primary" />,
        tone: "primary",
    },
];

type Props = {
    onPick?: (prompt: string) => void;
    className?: string;
};

export function TemplatePicker({ onPick, className }: Props) {
    return (
        <div className={cn("w-full max-w-3xl mx-auto pt-5", className)}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Templates</p>
                <p className="text-xs text-muted-foreground">
                    Click one to autofill your prompt
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {templates.map((t) => (
                    <MotionGlowCard
                        key={t.id}
                        onClick={() => onPick?.(t.prompt)}
                        className="group p-5 text-left cursor-pointer h-full"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div
                                className={cn(
                                    "h-9 w-9 rounded-xl flex items-center justify-center border transition-colors",
                                    t.tone === "primary"
                                        ? "bg-primary/10 border-primary/30 text-primary"
                                        : "bg-muted border-border text-foreground/80"
                                )}
                            >
                                {t.icon}
                            </div>

                            <span
                                className={cn(
                                    "text-[10px] rounded-full px-2 py-0.5 border transition-colors",
                                    t.tone === "primary"
                                        ? "border-primary/30 text-primary"
                                        : "border-border text-muted-foreground group-hover:border-primary/30 group-hover:text-primary"
                                )}
                            >
                                Use
                            </span>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-sm font-semibold leading-tight">{t.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 text-ellipsis overflow-hidden whitespace-nowrap">{t.subtitle}</p>
                        </div>
                    </MotionGlowCard>
                ))}
            </div>

            <div className="mt-4 flex justify-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() =>
                        onPick?.(
                            "Build a modern SaaS app with auth, dashboard, pricing page, and responsive UI."
                        )
                    }
                >
                    Generate a random idea →
                </Button>
            </div>
        </div>
    );
}
