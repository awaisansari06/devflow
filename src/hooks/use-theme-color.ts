import { useState, useEffect } from "react";
import {
    applyThemeColor,
    getStoredThemeColor,
    saveThemeColor,
    DEFAULT_COLOR,
} from "@/lib/theme-colors";

export function useThemeColor() {
    const [color, setColor] = useState<string>(DEFAULT_COLOR);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load color from localStorage on mount
    useEffect(() => {
        const storedColor = getStoredThemeColor();
        setColor(storedColor);
        applyThemeColor(storedColor);
        setIsLoaded(true);
    }, []);

    const updateColor = (newColor: string) => {
        setColor(newColor);
        saveThemeColor(newColor);
        applyThemeColor(newColor);
    };

    const resetColor = () => {
        updateColor(DEFAULT_COLOR);
    };

    return {
        color,
        updateColor,
        resetColor,
        isLoaded,
    };
}
