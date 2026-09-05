"use client";

import { dark } from "@clerk/themes";
import { UserButton } from "@clerk/nextjs";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/color-picker";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PaletteIcon } from "lucide-react";

interface Props {
    showName?: boolean;
};

export const ThemeDialog = () => {
    const { color, updateColor, resetColor } = useThemeColor();
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    return (
        <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 cursor-pointer"
                    title="Theme & Colors"
                    aria-label="Customize theme and colors"
                >
                    <PaletteIcon className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Theme & Appearance</DialogTitle>
                    <DialogDescription>
                        Switch theme mode and personalize your accent color
                    </DialogDescription>
                </DialogHeader>
                <ColorPicker
                    value={color}
                    onChange={updateColor}
                    onReset={resetColor}
                />
            </DialogContent>
        </Dialog>
    );
};

export const UserControl = ({ showName }: Props) => {
    const currentTheme = useCurrentTheme();

    return (
        <div className="flex items-center gap-2">
            <ThemeDialog />

            <UserButton
                showName={showName}
                appearance={{
                    elements: {
                        userButtonBox: "rounded-md!",
                        userButtonAvatarBox: "rounded-md! size-8!",
                        userButtonTrigger: "rounded-md!"
                    },
                    baseTheme: currentTheme === "dark" ? dark : undefined,
                }}
            />
        </div>
    );
};

