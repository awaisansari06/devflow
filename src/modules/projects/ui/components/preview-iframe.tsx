import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PreviewIframeProps {
    src?: string;
    fragmentKey: number;
    isEditing: boolean;
    onLoad?: () => void;
}

export const PreviewIframe = forwardRef<HTMLIFrameElement, PreviewIframeProps>(
    ({ src, fragmentKey, isEditing, onLoad }, ref) => {
        return (
            <div
                className={cn(
                    "flex-1 min-h-0 bg-white relative overflow-hidden",
                    isEditing && "cursor-crosshair"
                )}
            >
                <iframe
                    ref={ref}
                    key={fragmentKey}
                    className="absolute inset-0 h-full w-full border-0"
                    {...(!isEditing && {
                        sandbox: "allow-forms allow-scripts allow-same-origin allow-popups",
                    })}
                    loading={isEditing ? "eager" : "lazy"}
                    src={src}
                    title="Sandbox Preview"
                    onLoad={onLoad}
                />
            </div>
        );
    }
);

PreviewIframe.displayName = "PreviewIframe";
