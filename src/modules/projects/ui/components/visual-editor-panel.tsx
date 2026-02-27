"use client";

import { useState, useCallback, useEffect } from "react";
import {
    PaintbrushIcon,
    TypeIcon,
    SpaceIcon,
    XIcon,
    SaveIcon,
    UndoIcon,
    Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { rgbToHex } from "@/lib/visual-editor-patcher";

interface SelectedElementData {
    selector: string;
    tagName: string;
    text: string | null;
    className: string;
    styles: {
        color: string;
        backgroundColor: string;
        fontSize: string;
        fontWeight: string;
        padding: string;
        margin: string;
        borderRadius: string;
        borderColor: string;
        opacity: string;
    };
    rect: { top: number; left: number; width: number; height: number };
}

interface StyleChange {
    property: string;
    value: string;
}

interface VisualEditorPanelProps {
    selectedElement: SelectedElementData | null;
    onApplyStyle: (property: string, value: string) => void;
    onApplyText: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    hasChanges: boolean;
}

export const VisualEditorPanel = ({
    selectedElement,
    onApplyStyle,
    onApplyText,
    onSave,
    onCancel,
    isSaving,
    hasChanges,
}: VisualEditorPanelProps) => {
    const [textValue, setTextValue] = useState("");
    const [colorValue, setColorValue] = useState("#000000");
    const [bgColorValue, setBgColorValue] = useState("#ffffff");
    const [fontSizeValue, setFontSizeValue] = useState("16");
    const [paddingValue, setPaddingValue] = useState("0");
    const [marginValue, setMarginValue] = useState("0");
    const [borderRadiusValue, setBorderRadiusValue] = useState("0");
    const [opacityValue, setOpacityValue] = useState("100");

    // Sync state when a new element is selected
    useEffect(() => {
        if (!selectedElement) return;
        const { styles, text } = selectedElement;

        setTextValue(text || "");
        setColorValue(rgbToHex(styles.color));
        setBgColorValue(rgbToHex(styles.backgroundColor));
        setFontSizeValue(parseInt(styles.fontSize) + "" || "16");
        setPaddingValue(parseInt(styles.padding) + "" || "0");
        setMarginValue(parseInt(styles.margin) + "" || "0");
        setBorderRadiusValue(parseInt(styles.borderRadius) + "" || "0");
        setOpacityValue(Math.round(parseFloat(styles.opacity) * 100) + "" || "100");
    }, [selectedElement]);

    if (!selectedElement) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground gap-3">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <PaintbrushIcon className="size-5" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">Select an Element</p>
                    <p className="text-xs mt-1">Click any element in the preview to start editing its visual properties.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-sidebar shrink-0">
                <div className="flex items-center gap-2">
                    <PaintbrushIcon className="size-4 text-primary" />
                    <span className="text-sm font-semibold">Visual Editor</span>
                </div>
                <div className="flex items-center gap-1">
                    {hasChanges && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onCancel}
                            className="h-7 px-2 text-xs"
                        >
                            <UndoIcon className="size-3 mr-1" />
                            Reset
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={!hasChanges || isSaving}
                        className="h-7 px-3 text-xs"
                    >
                        {isSaving ? (
                            <Loader2Icon className="size-3 animate-spin mr-1" />
                        ) : (
                            <SaveIcon className="size-3 mr-1" />
                        )}
                        Save
                    </Button>
                </div>
            </div>

            {/* Selected Element Badge */}
            <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        &lt;{selectedElement.tagName}&gt;
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                        {selectedElement.selector}
                    </span>
                </div>
            </div>

            {/* Edit Sections */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Text Content */}
                {selectedElement.text !== null && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <TypeIcon className="size-3.5 text-muted-foreground" />
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Text Content
                            </Label>
                        </div>
                        <Input
                            value={textValue}
                            onChange={(e) => {
                                setTextValue(e.target.value);
                                onApplyText(e.target.value);
                            }}
                            className="h-8 text-sm"
                            placeholder="Element text..."
                        />
                    </div>
                )}

                <Separator />

                {/* Colors */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <PaintbrushIcon className="size-3.5 text-muted-foreground" />
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Colors
                        </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Text</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={colorValue}
                                    onChange={(e) => {
                                        setColorValue(e.target.value);
                                        onApplyStyle("color", e.target.value);
                                    }}
                                    className="h-8 w-8 rounded border cursor-pointer bg-transparent"
                                />
                                <Input
                                    value={colorValue}
                                    onChange={(e) => {
                                        setColorValue(e.target.value);
                                        onApplyStyle("color", e.target.value);
                                    }}
                                    className="h-8 text-xs font-mono flex-1"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">Background</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={bgColorValue}
                                    onChange={(e) => {
                                        setBgColorValue(e.target.value);
                                        onApplyStyle("backgroundColor", e.target.value);
                                    }}
                                    className="h-8 w-8 rounded border cursor-pointer bg-transparent"
                                />
                                <Input
                                    value={bgColorValue}
                                    onChange={(e) => {
                                        setBgColorValue(e.target.value);
                                        onApplyStyle("backgroundColor", e.target.value);
                                    }}
                                    className="h-8 text-xs font-mono flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Typography */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <TypeIcon className="size-3.5 text-muted-foreground" />
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Typography
                        </Label>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">
                            Font Size ({fontSizeValue}px)
                        </Label>
                        <input
                            type="range"
                            min="8"
                            max="96"
                            value={fontSizeValue}
                            onChange={(e) => {
                                setFontSizeValue(e.target.value);
                                onApplyStyle("fontSize", e.target.value + "px");
                            }}
                            className="w-full accent-primary"
                        />
                    </div>
                </div>

                <Separator />

                {/* Spacing */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <SpaceIcon className="size-3.5 text-muted-foreground" />
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Spacing
                        </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">
                                Padding ({paddingValue}px)
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="64"
                                value={paddingValue}
                                onChange={(e) => {
                                    setPaddingValue(e.target.value);
                                    onApplyStyle("padding", e.target.value + "px");
                                }}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">
                                Margin ({marginValue}px)
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="64"
                                value={marginValue}
                                onChange={(e) => {
                                    setMarginValue(e.target.value);
                                    onApplyStyle("margin", e.target.value + "px");
                                }}
                                className="w-full accent-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">
                                Border Radius ({borderRadiusValue}px)
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={borderRadiusValue}
                                onChange={(e) => {
                                    setBorderRadiusValue(e.target.value);
                                    onApplyStyle("borderRadius", e.target.value + "px");
                                }}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-muted-foreground">
                                Opacity ({opacityValue}%)
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={opacityValue}
                                onChange={(e) => {
                                    setOpacityValue(e.target.value);
                                    onApplyStyle("opacity", (parseInt(e.target.value) / 100).toString());
                                }}
                                className="w-full accent-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
