"use client";

import { CodeExplanation } from "@/lib/ai/explain-code";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    CopyIcon,
    CheckIcon,
    SparklesIcon,
    ListIcon,
    LightbulbIcon,
    AlertCircleIcon,
    InfoIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CodeExplanationPanelProps {
    open: boolean;
    onClose: () => void;
    explanation: CodeExplanation | null;
    isLoading: boolean;
}

export function CodeExplanationPanel({
    open,
    onClose,
    explanation,
    isLoading,
}: CodeExplanationPanelProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState({
        overview: true,
        lineByLine: true,
        concepts: true,
        bestPractices: true,
    });

    const handleCopy = async (text: string, section: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSection(section);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopiedSection(null), 2000);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const getSeverityIcon = (severity?: string) => {
        switch (severity) {
            case "warning":
                return <AlertCircleIcon className="size-4 text-yellow-500" />;
            case "info":
                return <InfoIcon className="size-4 text-blue-500" />;
            default:
                return <LightbulbIcon className="size-4 text-green-500" />;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="size-5 text-primary" />
                        <SheetTitle>Code Explanation</SheetTitle>
                    </div>
                    <SheetDescription>
                        AI-powered analysis of your code with explanations and best practices
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)]">
                    <div className="p-6 space-y-6">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">
                                    Analyzing your code...
                                </p>
                            </div>
                        )}

                        {!isLoading && explanation && (
                            <>
                                {/* Overview Section */}
                                <Collapsible
                                    open={expandedSections.overview}
                                    onOpenChange={() => toggleSection("overview")}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                                                    <div className="flex items-center gap-2">
                                                        {expandedSections.overview ? (
                                                            <ChevronDownIcon className="size-4" />
                                                        ) : (
                                                            <ChevronRightIcon className="size-4" />
                                                        )}
                                                        <h3 className="font-semibold text-base">Overview</h3>
                                                    </div>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(explanation.overview, "overview")}
                                                className="h-8"
                                            >
                                                {copiedSection === "overview" ? (
                                                    <CheckIcon className="size-3 mr-1" />
                                                ) : (
                                                    <CopyIcon className="size-3 mr-1" />
                                                )}
                                                Copy
                                            </Button>
                                        </div>
                                        <CollapsibleContent>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {explanation.overview}
                                            </p>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Line by Line Section */}
                                {explanation.lineByLine.length > 0 && (
                                    <Collapsible
                                        open={expandedSections.lineByLine}
                                        onOpenChange={() => toggleSection("lineByLine")}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                                                        <div className="flex items-center gap-2">
                                                            {expandedSections.lineByLine ? (
                                                                <ChevronDownIcon className="size-4" />
                                                            ) : (
                                                                <ChevronRightIcon className="size-4" />
                                                            )}
                                                            <ListIcon className="size-4 text-primary" />
                                                            <h3 className="font-semibold text-base">
                                                                Line-by-Line Explanation
                                                            </h3>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({explanation.lineByLine.length} lines)
                                                            </span>
                                                        </div>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="space-y-3">
                                                    {explanation.lineByLine.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <span className="inline-flex items-center justify-center size-6 rounded bg-primary/10 text-primary text-xs font-mono font-semibold shrink-0">
                                                                    {item.line}
                                                                </span>
                                                                <p className="text-sm flex-1">{item.explanation}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )}

                                {/* Concepts Section */}
                                {explanation.concepts.length > 0 && (
                                    <Collapsible
                                        open={expandedSections.concepts}
                                        onOpenChange={() => toggleSection("concepts")}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                                                        <div className="flex items-center gap-2">
                                                            {expandedSections.concepts ? (
                                                                <ChevronDownIcon className="size-4" />
                                                            ) : (
                                                                <ChevronRightIcon className="size-4" />
                                                            )}
                                                            <SparklesIcon className="size-4 text-blue-500" />
                                                            <h3 className="font-semibold text-base">Key Concepts</h3>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({explanation.concepts.length})
                                                            </span>
                                                        </div>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="space-y-3">
                                                    {explanation.concepts.map((concept, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                                                        >
                                                            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                                                                {concept.name}
                                                            </h4>
                                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                                {concept.explanation}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )}

                                {/* Best Practices Section */}
                                {explanation.bestPractices.length > 0 && (
                                    <Collapsible
                                        open={expandedSections.bestPractices}
                                        onOpenChange={() => toggleSection("bestPractices")}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                                                        <div className="flex items-center gap-2">
                                                            {expandedSections.bestPractices ? (
                                                                <ChevronDownIcon className="size-4" />
                                                            ) : (
                                                                <ChevronRightIcon className="size-4" />
                                                            )}
                                                            <LightbulbIcon className="size-4 text-green-500" />
                                                            <h3 className="font-semibold text-base">Best Practices</h3>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({explanation.bestPractices.length})
                                                            </span>
                                                        </div>
                                                    </Button>
                                                </CollapsibleTrigger>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="space-y-3">
                                                    {explanation.bestPractices.map((practice, index) => (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "p-4 rounded-lg border",
                                                                practice.severity === "warning"
                                                                    ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
                                                                    : practice.severity === "info"
                                                                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                                                                        : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                                                            )}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {getSeverityIcon(practice.severity)}
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-sm mb-1">
                                                                        {practice.title}
                                                                    </h4>
                                                                    <p className="text-sm opacity-90">
                                                                        {practice.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                )}
                            </>
                        )}

                        {!isLoading && !explanation && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                                <SparklesIcon className="size-12 text-muted-foreground/50" />
                                <div>
                                    <p className="font-medium">No explanation yet</p>
                                    <p className="text-sm text-muted-foreground">
                                        Click "Explain Code" to get started
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
