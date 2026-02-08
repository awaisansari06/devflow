import { useState, useEffect } from "react";
import { Template } from "@/lib/templates";

const STORAGE_KEY = "devflow-template-history";
const MAX_HISTORY = 5;

export function useTemplateHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setHistory(Array.isArray(parsed) ? parsed : []);
            }
        } catch (error) {
            console.error("Failed to load template history:", error);
        }
    }, []);

    // Add template to history
    const addToHistory = (templateId: string) => {
        setHistory((prev) => {
            // Remove if already exists
            const filtered = prev.filter((id) => id !== templateId);
            // Add to front
            const newHistory = [templateId, ...filtered].slice(0, MAX_HISTORY);

            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            } catch (error) {
                console.error("Failed to save template history:", error);
            }

            return newHistory;
        });
    };

    // Clear history
    const clearHistory = () => {
        setHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to clear template history:", error);
        }
    };

    return {
        history,
        addToHistory,
        clearHistory,
    };
}
