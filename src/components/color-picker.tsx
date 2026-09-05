import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ColorPresets } from "@/components/color-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { hueToOklch, extractHue, isValidOklchColor } from "@/lib/theme-colors";
import { RotateCcwIcon, SunIcon, MoonIcon, LaptopIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    onReset?: () => void;
}

export function ColorPicker({ value, onChange, onReset }: ColorPickerProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [hue, setHue] = useState(() => extractHue(value));
    const [customInput, setCustomInput] = useState(value);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleHueChange = (newHue: number[]) => {
        const hueValue = newHue[0];
        setHue(hueValue);
        const newColor = hueToOklch(hueValue);
        setCustomInput(newColor);
        onChange(newColor);
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setCustomInput(input);

        if (isValidOklchColor(input)) {
            const newHue = extractHue(input);
            setHue(newHue);
            onChange(input);
        }
    };

    const handlePresetSelect = (color: string) => {
        const newHue = extractHue(color);
        setHue(newHue);
        setCustomInput(color);
        onChange(color);
    };

    return (
        <div className="space-y-6">
            {/* Theme Mode Section */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Theme Mode
                    </Label>
                    <span className="text-[11px] text-muted-foreground capitalize">
                        {mounted ? theme : "system"}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        type="button"
                        variant={mounted && theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className={cn(
                            "flex items-center justify-center gap-2 h-9 transition-all cursor-pointer",
                            mounted && theme === "light"
                                ? "shadow-sm font-semibold"
                                : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <SunIcon className="size-4 shrink-0 text-amber-500" />
                        <span className="text-xs">Light</span>
                    </Button>
                    <Button
                        type="button"
                        variant={mounted && theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className={cn(
                            "flex items-center justify-center gap-2 h-9 transition-all cursor-pointer",
                            mounted && theme === "dark"
                                ? "shadow-sm font-semibold"
                                : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MoonIcon className="size-4 shrink-0 text-blue-400" />
                        <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                        type="button"
                        variant={mounted && theme === "system" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("system")}
                        className={cn(
                            "flex items-center justify-center gap-2 h-9 transition-all cursor-pointer",
                            mounted && theme === "system"
                                ? "shadow-sm font-semibold"
                                : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LaptopIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-xs">System</span>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Accent Color Section */}
            <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Accent Color
                </Label>
                <ColorPresets selectedColor={value} onSelect={handlePresetSelect} />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Custom Color</Label>
                    {onReset && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-8 text-xs"
                        >
                            <RotateCcwIcon className="size-3 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="hue-slider" className="text-xs text-muted-foreground">
                                Hue: {Math.round(hue)}°
                            </Label>
                            <div
                                className="size-6 rounded border-2 border-border shadow-sm"
                                style={{ backgroundColor: hueToOklch(hue) }}
                            />
                        </div>
                        <Slider
                            id="hue-slider"
                            min={0}
                            max={360}
                            step={1}
                            value={[hue]}
                            onValueChange={handleHueChange}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-color" className="text-xs text-muted-foreground">
                            OKLCH Value
                        </Label>
                        <Input
                            id="custom-color"
                            value={customInput}
                            onChange={handleCustomInputChange}
                            placeholder="oklch(0.4650 0.1470 24.9381)"
                            className="font-mono text-xs"
                        />
                        {!isValidOklchColor(customInput) && customInput && (
                            <p className="text-xs text-destructive">
                                Invalid OKLCH format
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
