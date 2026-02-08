import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean; // Cmd on Mac
    callback: (event: KeyboardEvent) => void;
    description?: string;
    preventDefault?: boolean;
    enabled?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 * Automatically handles Ctrl (Windows/Linux) vs Cmd (Mac)
 */
export function useKeyboardShortcut(
    shortcuts: KeyboardShortcut | KeyboardShortcut[],
    deps: React.DependencyList = []
) {
    const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts];
    const callbacksRef = useRef<Map<string, (e: KeyboardEvent) => void>>(new Map());

    // Update callbacks ref when dependencies change
    useEffect(() => {
        shortcutsArray.forEach((shortcut) => {
            const key = getShortcutKey(shortcut);
            callbacksRef.current.set(key, shortcut.callback);
        });
    }, deps);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs (except for specific cases)
            const target = event.target as HTMLElement;
            const isInput = target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            shortcutsArray.forEach((shortcut) => {
                // Skip if disabled
                if (shortcut.enabled === false) return;

                // For Ctrl+K and Ctrl+/, allow even in inputs
                const isGlobalShortcut = (shortcut.ctrl || shortcut.meta) &&
                    (shortcut.key.toLowerCase() === "k" ||
                        shortcut.key === "/");

                // Skip if in input and not a global shortcut
                if (isInput && !isGlobalShortcut) return;

                // Check if shortcut matches
                const matches = matchesShortcut(event, shortcut);

                if (matches) {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }

                    const key = getShortcutKey(shortcut);
                    const callback = callbacksRef.current.get(key);
                    callback?.(event);
                }
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shortcutsArray]);
}

/**
 * Check if event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const key = event.key.toLowerCase();
    const targetKey = shortcut.key.toLowerCase();

    // Key must match
    if (key !== targetKey) return false;

    // Check modifiers
    const ctrlOrMeta = event.ctrlKey || event.metaKey;
    const needsCtrl = shortcut.ctrl || shortcut.meta;

    if (needsCtrl && !ctrlOrMeta) return false;
    if (!needsCtrl && ctrlOrMeta) return false;

    // Only check shift if explicitly specified
    if (shortcut.shift === true && !event.shiftKey) return false;
    if (shortcut.shift === false && event.shiftKey) return false;

    // Only check alt if explicitly specified
    if (shortcut.alt === true && !event.altKey) return false;
    if (shortcut.alt === false && event.altKey) return false;

    return true;
}

/**
 * Generate unique key for shortcut
 */
function getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrl || shortcut.meta) parts.push("ctrl");
    if (shortcut.shift) parts.push("shift");
    if (shortcut.alt) parts.push("alt");
    parts.push(shortcut.key.toLowerCase());
    return parts.join("+");
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
    const isMac = typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const parts = [];

    if (shortcut.ctrl || shortcut.meta) {
        parts.push(isMac ? "⌘" : "Ctrl");
    }
    if (shortcut.shift) parts.push(isMac ? "⇧" : "Shift");
    if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? "" : "+");
}

/**
 * Get display string for a shortcut key combination
 */
export function getShortcutDisplay(key: string, ctrl = false, shift = false, alt = false): string {
    const isMac = typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const parts = [];

    if (ctrl) parts.push(isMac ? "⌘" : "Ctrl");
    if (shift) parts.push(isMac ? "⇧" : "Shift");
    if (alt) parts.push(isMac ? "⌥" : "Alt");
    parts.push(key.toUpperCase());

    return parts.join(isMac ? "" : "+");
}
