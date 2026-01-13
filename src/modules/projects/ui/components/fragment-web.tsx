import { useState } from "react";
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react";

import { Fragment } from "@/generated/prisma/models";
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
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="h-12 flex items-center px-4 bg-sidebar border-b gap-x-2">
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
                        className="flex-1 h-7 justify-start text-start font-normal"
                    >
                        <span className="truncate">
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
            <iframe
                key={fragmentKey}
                className="h-full w-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                loading="lazy"
                src={data.sandboxUrl}
            />
        </div>
    )
}