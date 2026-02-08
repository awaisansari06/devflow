import { useState } from "react";
import { ColorPresets } from "@/components/color-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { hueToOklch, extractHue, isValidOklchColor } from "@/lib/theme-colors";
import { RotateCcwIcon } from "lucide-react";

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    onReset?: () => void;
}

export function ColorPicker({ value, onChange, onReset }: ColorPickerProps) {
    const [hue, setHue] = useState(() => extractHue(value));
    const [customInput, setCustomInput] = useState(value);

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
            <ColorPresets selectedColor={value} onSelect={handlePresetSelect} />

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
