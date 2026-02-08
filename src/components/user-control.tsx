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

export const UserControl = ({ showName }: Props) => {
    const currentTheme = useCurrentTheme();
    const { color, updateColor, resetColor } = useThemeColor();
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    return (
        <div className="flex items-center gap-2">
            <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9"
                        title="Customize Colors"
                    >
                        <PaletteIcon className="size-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Customize Colors</DialogTitle>
                        <DialogDescription>
                            Choose a color preset or create your own custom accent color
                        </DialogDescription>
                    </DialogHeader>
                    <ColorPicker
                        value={color}
                        onChange={updateColor}
                        onReset={resetColor}
                    />
                </DialogContent>
            </Dialog>

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
