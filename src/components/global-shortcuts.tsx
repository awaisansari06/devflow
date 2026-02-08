"use client";

import { useRouter } from "next/navigation";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useState } from "react";
import { ShortcutsHelpModal } from "./shortcuts-help-modal";

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

    return <ShortcutsHelpModal open={showHelp} onOpenChange={setShowHelp} />;
}
