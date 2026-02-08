"use client";

import { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

interface TemplateCardProps {
    template: Template;
    onClick: () => void;
    isRecentlyUsed?: boolean;
}

const difficultyColors = {
    beginner: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export function TemplateCard({ template, onClick, isRecentlyUsed }: TemplateCardProps) {
    const Icon = template.icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative p-4 rounded-lg border bg-card text-left transition-all",
                "hover:border-primary/50 hover:shadow-md hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "active:scale-[0.98]"
            )}
        >
            {/* Recently Used Badge */}
            {isRecentlyUsed && (
                <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        <Clock className="size-3 mr-1" />
                        Recent
                    </Badge>
                </div>
            )}

            {/* Icon */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon className="size-5 text-primary" />
                </div>

                {/* Difficulty Badge */}
                <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0.5", difficultyColors[template.difficulty])}
                >
                    {template.difficulty}
                </Badge>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">
                    {template.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {template.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {template.estimatedTime}
                    </span>
                    <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Use
                        <Zap className="size-3" />
                    </span>
                </div>
            </div>
        </button>
    );
}
