// Color presets for quick selection
export const COLOR_PRESETS = [
    {
        name: "Orange",
        value: "oklch(0.4650 0.1470 24.9381)",
        hue: 24.9381,
    },
    {
        name: "Blue",
        value: "oklch(0.4650 0.1470 240)",
        hue: 240,
    },
    {
        name: "Green",
        value: "oklch(0.4650 0.1470 140)",
        hue: 140,
    },
    {
        name: "Purple",
        value: "oklch(0.4650 0.1470 280)",
        hue: 280,
    },
    {
        name: "Pink",
        value: "oklch(0.4650 0.1470 340)",
        hue: 340,
    },
    {
        name: "Red",
        value: "oklch(0.4650 0.1470 15)",
        hue: 15,
    },
    {
        name: "Teal",
        value: "oklch(0.4650 0.1470 180)",
        hue: 180,
    },
    {
        name: "Yellow",
        value: "oklch(0.4650 0.1470 90)",
        hue: 90,
    },
] as const;

export const DEFAULT_COLOR = COLOR_PRESETS[0].value;

/**
 * Apply theme color to CSS custom properties
 */
export function applyThemeColor(color: string) {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Update primary color
    root.style.setProperty("--primary", color);

    // Update related colors that should match primary
    root.style.setProperty("--ring", color);
    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--chart-2", color);
}

/**
 * Get theme color from localStorage or default
 */
export function getStoredThemeColor(): string {
    if (typeof window === "undefined") return DEFAULT_COLOR;

    try {
        const stored = localStorage.getItem("theme-color");
        return stored || DEFAULT_COLOR;
    } catch {
        return DEFAULT_COLOR;
    }
}

/**
 * Save theme color to localStorage
 */
export function saveThemeColor(color: string) {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem("theme-color", color);
    } catch (error) {
        console.error("Failed to save theme color:", error);
    }
}

/**
 * Convert hue to oklch color string
 */
export function hueToOklch(hue: number): string {
    return `oklch(0.4650 0.1470 ${hue})`;
}

/**
 * Extract hue from oklch color string
 */
export function extractHue(oklchColor: string): number {
    const match = oklchColor.match(/oklch\([^)]+\s+([^)]+)\)/);
    if (match) {
        return parseFloat(match[1]);
    }
    return 24.9381; // Default orange hue
}

/**
 * Validate oklch color format
 */
export function isValidOklchColor(color: string): boolean {
    return /^oklch\(\d+\.?\d*\s+\d+\.?\d*\s+\d+\.?\d*\)$/.test(color);
}
