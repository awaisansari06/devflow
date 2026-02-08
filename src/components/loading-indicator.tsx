import { Progress } from "@/components/ui/progress";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    message?: string;
    progress?: number;
    showPercentage?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingIndicator({
    message = "Loading...",
    progress,
    showPercentage = false,
    size = "md",
    className,
}: LoadingIndicatorProps) {
    const sizeClasses = {
        sm: "text-sm gap-2",
        md: "text-base gap-3",
        lg: "text-lg gap-4",
    };

    const iconSizes = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center", sizeClasses[size], className)}>
            <div className="flex items-center gap-2">
                <Loader2Icon className={cn("animate-spin text-primary", iconSizes[size])} />
                <span className="text-muted-foreground">{message}</span>
            </div>

            {progress !== undefined && (
                <div className="w-full max-w-xs space-y-1">
                    <Progress value={progress} className="h-2" />
                    {showPercentage && (
                        <p className="text-xs text-center text-muted-foreground">
                            {Math.round(progress)}%
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// Inline loading indicator for smaller spaces
export function InlineLoadingIndicator({
    message = "Loading...",
    className,
}: {
    message?: string;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
            <Loader2Icon className="size-4 animate-spin" />
            <span>{message}</span>
        </div>
    );
}

// Full page loading overlay
export function LoadingOverlay({
    message = "Loading...",
    progress,
    showPercentage = true,
}: {
    message?: string;
    progress?: number;
    showPercentage?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingIndicator
                message={message}
                progress={progress}
                showPercentage={showPercentage}
                size="lg"
            />
        </div>
    );
}
