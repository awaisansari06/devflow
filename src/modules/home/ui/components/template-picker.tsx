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
    prompt:
      "Build a Netflix-style streaming homepage using mock data and local state. Include: a sticky top navbar, a cinematic hero banner with a subtle dark gradient background, multiple horizontal movie rows (Trending, Top Picks, New Releases), responsive poster cards with hover effects, and a modal for movie details (title, rating, genre, description). Add a search input and category chips. Use a premium dark theme with restrained red accents, soft shadows, and smooth transitions. Include footer links and ensure the UI looks modern (not grayscale).",
    icon: <Film className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "admin",
    title: "Admin Dashboard",
    subtitle: "Charts + tables",
    prompt:
      "Create a modern admin dashboard with a sidebar navigation, a top header (search + profile menu), stat cards, and a main content area. Include a chart section using a clean placeholder UI (no external chart library unless installed), and a table with filter, sort, and pagination using local state. Add a small 'Recent Activity' panel. Use premium spacing, subtle borders, and a neutral base with one accent color (indigo/blue/emerald). Ensure dark mode compatibility and polished hover states.",
    icon: <LayoutDashboard className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "kanban",
    title: "Kanban Board",
    subtitle: "Drag & drop tasks",
    prompt:
      "Build a production-ready Kanban board with 3–4 columns (Backlog, In Progress, Review, Done) using local state. Implement drag-and-drop using native HTML5 drag events (no external drag-drop libraries). Support: add task, edit task title, delete task, move task between columns, and a task details modal. Add a small toolbar with search + priority filter. Use consistent column widths, smooth hover states, and a premium UI with subtle gradients and a tasteful accent color. Include a navbar + footer and make it fully responsive.",
    icon: <KanbanSquare className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "file-manager",
    title: "File Manager",
    subtitle: "Folders + uploads",
    prompt:
      "Build a file manager UI with a left sidebar for folders, a main file grid, and a top toolbar (search, sort, upload button). Use mock data + local state. Support: create folder, rename item, delete item, and select multiple items. Add clear icons, file type badges, and an empty state when a folder is empty. Use premium spacing, soft shadows, subtle borders, and a calm accent color. Include navbar + footer and make it responsive.",
    icon: <FolderKanban className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "youtube",
    title: "YouTube Clone",
    subtitle: "Feed + video page",
    prompt:
      "Build a YouTube-style UI using mock data and local state. Include: top navbar with search, left sidebar categories, a responsive video grid with thumbnail placeholders, and a video preview modal showing title, channel, views, and description. Add category filtering and a 'Watch Later' toggle. Use clean alignment, good typography hierarchy, and a premium neutral UI with a restrained accent color (red or blue). Include footer and smooth hover transitions.",
    icon: <Youtube className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "store",
    title: "Store Page",
    subtitle: "Products + cart",
    prompt:
      "Build a premium e-commerce store page with a navbar, category filters, a product grid, and a cart drawer/side panel using local state. Support: add to cart, remove, quantity update, and subtotal calculation. Add product details modal with description + rating + stock badge. Include sorting (price low/high, newest). Use a modern clean design with clear primary buttons (not gray), subtle shadows, and tasteful accent color. Include footer and responsive layout.",
    icon: <ShoppingBag className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "airbnb",
    title: "Airbnb Clone",
    subtitle: "Listings + filters",
    prompt:
      "Build an Airbnb-style listings page using mock data and local state. Include: top navbar, filter sidebar (price range, guests, rating), responsive listing grid, and a details modal with amenities, description, and booking CTA. Add a 'Saved' heart toggle and show saved count. Use soft shadows, clean layout, warm neutral surfaces, and a subtle accent color. Ensure it feels premium and welcoming (not grayscale). Include footer and responsive behavior.",
    icon: <Store className="h-4 w-4 text-primary" />,
    tone: "primary",
  },

  {
    id: "spotify",
    title: "Spotify Clone",
    subtitle: "Player + playlist UI",
    prompt:
      "Build a Spotify-style music player UI using mock data and local state. Include: sidebar playlists, main content showing album/track list, and a bottom playback bar (play/pause, next/prev, progress slider, volume). Support selecting tracks, play state, and progress simulation using local state + timers. Use a premium dark theme with restrained green accents, subtle gradients, and polished hover states. Include navbar/header and footer section. Must look modern and balanced (not boring black/white).",
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
