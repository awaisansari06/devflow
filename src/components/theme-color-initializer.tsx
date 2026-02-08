"use client";

import { useEffect } from "react";
import { applyThemeColor, getStoredThemeColor } from "@/lib/theme-colors";

export function ThemeColorInitializer() {
    useEffect(() => {
        // Apply stored theme color on mount
        const color = getStoredThemeColor();
        applyThemeColor(color);
    }, []);

    return null;
}
