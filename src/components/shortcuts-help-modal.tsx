import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
    {
        category: "Navigation",
        items: [
            { keys: "Ctrl+K", description: "Focus search/input" },
            { keys: "Ctrl+N", description: "New project" },
            { keys: "Esc", description: "Close modal" },
        ],
    },
    {
        category: "Actions",
        items: [
            { keys: "Enter", description: "Submit form" },
            { keys: "Ctrl+Enter", description: "Submit form (alternative)" },
            { keys: "Ctrl+E", description: "Export project" },
        ],
    },
    {
        category: "Help",
        items: [
            { keys: "Ctrl+/", description: "Show this help" },
        ],
    },
];

export function ShortcutsHelpModal({ open, onOpenChange }: Props) {
    // Detect if user is on Mac
    const isMac = typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    // Replace Ctrl with Cmd symbol for Mac
    const formatKeys = (keys: string) => {
        if (isMac) {
            return keys.replace(/Ctrl/g, "⌘");
        }
        return keys;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Speed up your workflow with these keyboard shortcuts
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {SHORTCUTS.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div
                                        key={item.keys}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">{item.description}</span>
                                        <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-muted-foreground bg-muted border border-border rounded">
                                            {formatKeys(item.keys)}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border">Esc</kbd> to close
                </div>
            </DialogContent>
        </Dialog>
    );
}
