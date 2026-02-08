import { Button } from "@/components/ui/button";
import { COLOR_PRESETS } from "@/lib/theme-colors";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface ColorPresetsProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

export function ColorPresets({ selectedColor, onSelect }: ColorPresetsProps) {
    return (
        <div className="space-y-3">
            <div className="text-sm font-medium">Color Presets</div>
            <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColor === preset.value;

                    return (
                        <button
                            key={preset.name}
                            onClick={() => onSelect(preset.value)}
                            className={cn(
                                "group relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all hover:scale-105",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent hover:border-muted-foreground/20"
                            )}
                            title={preset.name}
                        >
                            <div
                                className="size-10 rounded-full border-2 border-border shadow-sm transition-transform group-hover:scale-110"
                                style={{ backgroundColor: preset.value }}
                            >
                                {isSelected && (
                                    <div className="flex items-center justify-center size-full">
                                        <CheckIcon className="size-5 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium">{preset.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
