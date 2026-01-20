import { useState } from "react";
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";

import { Fragment } from "@prisma/client";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";

interface Props {
    data: Fragment;
};

export const FragmentWeb = ({ data }: Props) => {
    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);

    const onRefresh = () => {
        setFragmentKey((prev) => prev + 1);
    }

    const handleCopy = () => {
        if (!data.sandboxUrl) return;
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        // Added 'max-h-full' and 'flex-1' to ensure the outer container never 
        // exceeds the parent's height.
        <div className="flex flex-col w-full h-full flex-1 min-h-0 overflow-hidden max-h-full">
            <div className="h-12 flex items-center px-4 bg-sidebar border-b gap-x-2 shrink-0">
                <Hint text="Refresh" side="bottom" align="start">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={onRefresh}>
                        <RefreshCwIcon className="size-3.5" />
                    </Button>
                </Hint>
                <Hint text="Click to copy" side="bottom">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopy}
                        disabled={!data.sandboxUrl || copied}
                        className="flex-1 h-7 justify-start text-start font-normal bg-muted/50 overflow-hidden"
                    >
                        <span className="truncate text-xs">
                            {data.sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint text="Open in new tab" side="bottom" align="end">
                    <Button
                        size="sm"
                        disabled={!data.sandboxUrl}
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                            if (!data.sandboxUrl) return;
                            window.open(data.sandboxUrl, "_blank");
                        }}
                    >
                        <ExternalLinkIcon className="size-3.5" />
                    </Button>
                </Hint>
            </div>

            {/* The wrapper div is set to 'relative' with 'flex-1' and 'min-h-0'.
                This is the standard 'Flexbox Fix' for iframes in modern React apps.
            */}
            <div className="flex-1 w-full min-h-0 bg-white relative overflow-hidden">
                <iframe
                    key={fragmentKey}
                    // Absolute positioning ensures the iframe perfectly matches 
                    // the parent's boundaries without pushing the height down.
                    className="absolute inset-0 h-full w-full border-0"
                    sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                    loading="lazy"
                    src={data.sandboxUrl}
                    title="Sandbox Preview"
                />
            </div>
        </div>
    )
}