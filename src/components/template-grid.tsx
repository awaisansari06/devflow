"use client";

import { useState, useMemo } from "react";
import {
    Template,
    TemplateCategory,
    TEMPLATES,
    CATEGORY_LABELS,
    getTemplatesByCategory,
    searchTemplates,
    getTemplateById,
} from "@/lib/templates";
import { TemplateCard } from "@/components/template-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TemplateGridProps {
    onSelectTemplate: (template: Template) => void;
    recentlyUsedIds?: string[];
    onClearHistory?: () => void;
    className?: string;
    initialLimit?: number; // Number of templates to show initially
    userId?: string | null; // User ID to control Recently Used visibility
}

export function TemplateGrid({
    onSelectTemplate,
    recentlyUsedIds = [],
    onClearHistory,
    className,
    initialLimit = 6,
    userId,
}: TemplateGridProps) {
    const [selectedCategory, setSelectedCategory] =
        useState<TemplateCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAll, setShowAll] = useState(false);

    // Get filtered templates
    const filteredTemplates = useMemo(() => {
        let templates = TEMPLATES;

        // Filter by category
        if (selectedCategory !== "all") {
            templates = getTemplatesByCategory(selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const searchResults = searchTemplates(searchQuery);
            templates = templates.filter((t) =>
                searchResults.some((sr) => sr.id === t.id)
            );
        }

        return templates;
    }, [selectedCategory, searchQuery]);

    // Get recently used templates
    const recentTemplates = useMemo(() => {
        return recentlyUsedIds
            .map((id) => getTemplateById(id))
            .filter((t): t is Template => t !== undefined)
            .slice(0, 3);
    }, [recentlyUsedIds]);

    // Determine which templates to display
    const displayedTemplates = useMemo(() => {
        // If searching or category is selected, show all results
        if (searchQuery.trim() || selectedCategory !== "all" || showAll) {
            return filteredTemplates;
        }
        // Otherwise, show limited preview
        return filteredTemplates.slice(0, initialLimit);
    }, [filteredTemplates, searchQuery, selectedCategory, showAll, initialLimit]);

    const hasMore = filteredTemplates.length > displayedTemplates.length;

    const categories: TemplateCategory[] = [
        "all",
        "landing-pages",
        "dashboards",
        "games",
        "tools",
        "e-commerce",
    ];

    // Reset showAll when category or search changes
    const handleCategoryChange = (category: TemplateCategory) => {
        setSelectedCategory(category);
        setShowAll(false);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setShowAll(false);
    };

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Recently Used Section */}
            {userId && recentTemplates.length > 0 && !searchQuery && selectedCategory === "all" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <h3 className="text-sm font-semibold">Recently Used</h3>
                        </div>
                        {onClearHistory && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearHistory}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recentTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onClick={() => onSelectTemplate(template)}
                                isRecentlyUsed
                            />
                        ))}
                    </div>

                    {/* Divider for visual breathing room */}
                    <div className="my-8">
                        <div className="h-px w-full bg-linear-to-r from-transparent via-border/40 to-transparent" />
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                />
                {searchQuery && (
                    <button
                        onClick={() => handleSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <Tabs
                value={selectedCategory}
                onValueChange={(value) => handleCategoryChange(value as TemplateCategory)}
                className="w-full"
            >
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
                    {categories.map((category) => {
                        const count =
                            category === "all"
                                ? TEMPLATES.length
                                : TEMPLATES.filter((t) => t.category === category).length;

                        return (
                            <TabsTrigger
                                key={category}
                                value={category}
                                className="text-xs whitespace-nowrap"
                            >
                                {CATEGORY_LABELS[category]}
                                <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>

            {/* Templates Grid */}
            {displayedTemplates.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onClick={() => onSelectTemplate(template)}
                                isRecentlyUsed={recentlyUsedIds.includes(template.id)}
                            />
                        ))}
                    </div>

                    {/* See All / Show Less Button */}
                    {(hasMore || showAll) && selectedCategory === "all" && !searchQuery && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowAll(!showAll)}
                                className="gap-2"
                            >
                                {showAll ? (
                                    <>
                                        Show Less
                                        <ChevronDown className="size-4 rotate-180" />
                                    </>
                                ) : (
                                    <>
                                        See All {filteredTemplates.length} Templates
                                        <ChevronDown className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="size-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No templates found</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {searchQuery
                            ? `No templates match "${searchQuery}". Try a different search term.`
                            : "No templates in this category."}
                    </p>
                    {searchQuery && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSearchChange("")}
                            className="mt-4"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            )}

            {/* Template Count */}
            <div className="text-center text-xs text-muted-foreground">
                Showing {displayedTemplates.length} of {filteredTemplates.length} templates
                {selectedCategory === "all" && !searchQuery && ` • ${TEMPLATES.length} total`}
            </div>
        </div>
    );
}
