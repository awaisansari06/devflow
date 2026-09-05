import { ExternalLinkIcon, RefreshCwIcon, PencilIcon, XIcon } from "lucide-react";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewToolbarProps {
    sandboxUrl?: string;
    isEditing: boolean;
    copied: boolean;
    onRefresh: () => void;
    onCopy: () => void;
    onToggleEditMode: () => void;
    onOpenExternal: () => void;
}

export const PreviewToolbar = ({
    sandboxUrl,
    isEditing,
    copied,
    onRefresh,
    onCopy,
    onToggleEditMode,
    onOpenExternal,
}: PreviewToolbarProps) => {
    return (
        <div className="h-12 flex items-center px-4 bg-sidebar border-b gap-x-2 shrink-0">
            <Hint text="Refresh" side="bottom" align="start">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={onRefresh}
                    aria-label="Refresh preview"
                >
                    <RefreshCwIcon className="size-3.5" />
                </Button>
            </Hint>

            <Hint text="Click to copy sandbox URL" side="bottom">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onCopy}
                    disabled={!sandboxUrl || copied}
                    aria-label={copied ? "Copied to clipboard" : "Copy sandbox URL to clipboard"}
                    className="flex-1 h-7 justify-start text-start font-normal bg-muted/50 overflow-hidden"
                >
                    <span className="truncate text-xs">
                        {sandboxUrl || "Sandbox initializing..."}
                    </span>
                </Button>
            </Hint>

            {/* Visual Editor Toggle */}
            <Hint text={isEditing ? "Exit Edit Mode" : "Visual Editor"} side="bottom">
                <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    className={cn(
                        "h-7 w-7 p-0",
                        isEditing && "bg-primary text-primary-foreground"
                    )}
                    onClick={onToggleEditMode}
                    aria-label={isEditing ? "Exit visual edit mode" : "Enter visual edit mode"}
                >
                    {isEditing ? (
                        <XIcon className="size-3.5" />
                    ) : (
                        <PencilIcon className="size-3.5" />
                    )}
                </Button>
            </Hint>

            <Hint text="Open in new tab" side="bottom" align="end">
                <Button
                    size="sm"
                    disabled={!sandboxUrl}
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={onOpenExternal}
                    aria-label="Open sandbox in new tab"
                >
                    <ExternalLinkIcon className="size-3.5" />
                </Button>
            </Hint>
        </div>
    );
};
