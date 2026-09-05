"use client";

import { useRouter } from "next/navigation";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useState } from "react";
import { ShortcutsHelpModal } from "./shortcuts-help-modal";
import { KeyboardIcon } from "lucide-react";

export function GlobalShortcuts() {
    const router = useRouter();
    const [showHelp, setShowHelp] = useState(false);

    useKeyboardShortcut([
        {
            key: "k",
            ctrl: true,
            description: "Focus search",
            callback: () => {
                // Focus the main input on home page
                const input = document.querySelector('textarea[placeholder*="What would you like to build"]') as HTMLTextAreaElement;
                if (input) {
                    input.focus();
                    input.select();
                }
            },
        },
        {
            key: "n",
            ctrl: true,
            description: "New project",
            callback: () => {
                router.push("/");
            },
        },
        {
            key: "/",
            ctrl: true,
            description: "Show keyboard shortcuts",
            callback: () => {
                setShowHelp(true);
            },
        },
    ]);

    return (
        <>
            <ShortcutsHelpModal open={showHelp} onOpenChange={setShowHelp} />
            <button
                onClick={() => setShowHelp(true)}
                aria-label="View keyboard shortcuts"
                title="View keyboard shortcuts (Ctrl + /)"
                className="fixed bottom-4 right-4 z-30 hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground bg-background/80 hover:bg-background/95 backdrop-blur border rounded-full shadow-sm hover:text-foreground hover:border-primary/40 transition-all cursor-pointer"
            >
                <KeyboardIcon className="size-3.5" />
                <span>Shortcuts</span>
                <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded font-mono border text-muted-foreground">Ctrl+/</kbd>
            </button>
        </>
    );
}
