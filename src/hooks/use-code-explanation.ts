import { useState, useEffect } from "react";
import { generateExplainCodePrompt, parseExplanationResponse, CodeExplanation } from "@/lib/ai/explain-code";

interface UseCodeExplanationOptions {
    code: string;
    language: string;
}

// Simple hash function for cache key
function hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

// Cache key generator
function getCacheKey(code: string, language: string): string {
    return `code-explanation-${language}-${hashCode(code)}`;
}

// Load from cache
function loadFromCache(code: string, language: string): CodeExplanation | null {
    try {
        const cacheKey = getCacheKey(code, language);
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Check if cache is less than 7 days old
            const cacheAge = Date.now() - (parsed.timestamp || 0);
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            if (cacheAge < maxAge) {
                console.log("✅ Loaded explanation from cache");
                return parsed.explanation;
            } else {
                // Cache expired, remove it
                localStorage.removeItem(cacheKey);
            }
        }
    } catch (error) {
        console.error("Failed to load from cache:", error);
    }
    return null;
}

// Save to cache
function saveToCache(code: string, language: string, explanation: CodeExplanation): void {
    try {
        const cacheKey = getCacheKey(code, language);
        const cacheData = {
            explanation,
            timestamp: Date.now(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log("💾 Saved explanation to cache");
    } catch (error) {
        console.error("Failed to save to cache:", error);
    }
}

export function useCodeExplanation({ code, language }: UseCodeExplanationOptions) {
    const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load from cache on mount
    useEffect(() => {
        if (code && language) {
            const cached = loadFromCache(code, language);
            if (cached) {
                setExplanation(cached);
            }
        }
    }, [code, language]);

    const explainCode = async () => {
        if (!code || !language) {
            setError("Code and language are required");
            return;
        }

        // Check cache first
        const cached = loadFromCache(code, language);
        if (cached) {
            setExplanation(cached);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const prompt = generateExplainCodePrompt(code, language);

            const response = await fetch("/api/ai/explain", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get explanation: ${response.statusText}`);
            }

            const data = await response.json();

            // Debug logging
            console.log("API Response:", data);
            console.log("Explanation field:", data.explanation);
            console.log("Type of explanation:", typeof data.explanation);

            const parsedExplanation = parseExplanationResponse(data.explanation);
            console.log("Parsed explanation:", parsedExplanation);

            // Save to cache
            saveToCache(code, language, parsedExplanation);

            setExplanation(parsedExplanation);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to explain code";
            setError(errorMessage);
            console.error("Code explanation error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setExplanation(null);
        setError(null);
    };

    const clearCache = () => {
        if (code && language) {
            const cacheKey = getCacheKey(code, language);
            localStorage.removeItem(cacheKey);
            console.log("🗑️ Cleared cache for this code");
        }
    };

    return {
        explanation,
        isLoading,
        error,
        explainCode,
        reset,
        clearCache,
    };
}
