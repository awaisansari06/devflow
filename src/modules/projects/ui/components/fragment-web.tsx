import { useState, useRef, useCallback, useEffect } from "react";
import { ExternalLinkIcon, RefreshCwIcon, PencilIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Fragment } from "@prisma/client";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { getVisualEditorScript } from "@/lib/visual-editor-inject";
import { generatePatches, applyPatches, type VisualEdit } from "@/lib/visual-editor-patcher";
import { VisualEditorPanel } from "./visual-editor-panel";
import { cn } from "@/lib/utils";

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

interface Props {
    data: Fragment;
    onFullScreen?: () => void;
};

export const FragmentWeb = ({ data, onFullScreen }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null);
    const [pendingEdits, setPendingEdits] = useState<VisualEdit[]>([]);

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

    // ─── postMessage Communication ────────────────────────────
    const postToIframe = useCallback((msg: Record<string, unknown>) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(msg, "*");
        }
    }, []);

    const handleApplyStyle = useCallback((property: string, value: string) => {
        postToIframe({ type: "apply-style", property, value });
        setPendingEdits((prev) => {
            // Update existing edit for same property or add new one
            const existing = prev.findIndex(
                (e) => e.type === "style" && (e as any).property === property
            );
            const edit: VisualEdit = {
                type: "style",
                property,
                value,
                originalClassName: selectedElement?.className || "",
            };
            if (existing >= 0) {
                const next = [...prev];
                next[existing] = edit;
                return next;
            }
            return [...prev, edit];
        });
    }, [postToIframe, selectedElement]);

    const handleApplyText = useCallback((value: string) => {
        postToIframe({ type: "apply-text", value });
        setPendingEdits((prev) => {
            const existing = prev.findIndex((e) => e.type === "text");
            const edit: VisualEdit = {
                type: "text",
                oldText: selectedElement?.text || "",
                newText: value,
            };
            if (existing >= 0) {
                const next = [...prev];
                next[existing] = edit;
                return next;
            }
            return [...prev, edit];
        });
    }, [postToIframe, selectedElement]);

    // ─── Save Mutation ────────────────────────────────────────
    const updateFiles = useMutation(
        trpc.fragments.updateFiles.mutationOptions({
            onSuccess: () => {
                toast.success("Visual changes saved!");
                setPendingEdits([]);
                setSelectedElement(null);
                setIsEditing(false);
                // Refresh the iframe to show updated content
                setFragmentKey((prev) => prev + 1);
                // Invalidate queries so code tab shows updated files
                queryClient.invalidateQueries(
                    trpc.messages.getMany.queryOptions({ projectId: (data as any).message?.projectId || "" })
                );
            },
            onError: (err) => {
                toast.error("Failed to save: " + err.message);
            },
        })
    );

    const handleSave = useCallback(() => {
        if (!data.id || pendingEdits.length === 0) return;

        const files = (data.files || {}) as Record<string, string>;
        const patches = generatePatches(files, pendingEdits);

        if (patches.length === 0) {
            toast.info("No source code changes detected");
            return;
        }

        updateFiles.mutate({
            fragmentId: data.id,
            patches,
        });
    }, [data, pendingEdits, updateFiles]);

    const handleCancel = useCallback(() => {
        setPendingEdits([]);
        setSelectedElement(null);
        // Refresh iframe to revert live changes
        setFragmentKey((prev) => prev + 1);
    }, []);

    // ─── Compute iframe src ───────────────────────────────────
    // In edit mode, load via same-origin proxy so we can inject scripts
    const iframeSrc = isEditing && data.sandboxUrl
        ? `/api/visual-editor-proxy?url=${encodeURIComponent(data.sandboxUrl)}`
        : data.sandboxUrl;

    // ─── Toggle Edit Mode ─────────────────────────────────────
    const toggleEditMode = useCallback(() => {
        if (isEditing) {
            postToIframe({ type: "disable-editor" });
            setIsEditing(false);
            setSelectedElement(null);
            if (pendingEdits.length > 0) {
                setPendingEdits([]);
            }
            // Force refresh to reload original sandbox URL
            setFragmentKey((prev) => prev + 1);
        } else {
            setIsEditing(true);
            // Force refresh to load proxy URL
            setFragmentKey((prev) => prev + 1);
        }
    }, [isEditing, postToIframe, pendingEdits]);

    // ─── Listen for Messages from Iframe ──────────────────────
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            const msg = e.data;
            if (!msg || !msg.type) return;

            if (msg.type === "element-selected") {
                setSelectedElement(msg.data);
            } else if (msg.type === "editor-ready") {
                // Editor script successfully injected
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Inject editor script when iframe loads in edit mode
    const handleIframeLoad = useCallback(() => {
        if (isEditing) {
            // The proxy page is same-origin, so postMessage will work
            setTimeout(() => {
                postToIframe({
                    type: "inject-script",
                    script: getVisualEditorScript(),
                });
            }, 500);
        }
    }, [isEditing, postToIframe]);

    return (
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

                {/* Visual Editor Toggle */}
                <Hint text={isEditing ? "Exit Edit Mode" : "Visual Editor"} side="bottom">
                    <Button
                        size="sm"
                        variant={isEditing ? "default" : "outline"}
                        className={cn(
                            "h-7 w-7 p-0",
                            isEditing && "bg-primary text-primary-foreground"
                        )}
                        onClick={toggleEditMode}
                    >
                        {isEditing ? (
                            <XIcon className="size-3.5" />
                        ) : (
                            <PencilIcon className="size-3.5" />
                        )}
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

            <div className="flex flex-1 w-full min-h-0 overflow-hidden">
                {/* Preview Iframe */}
                <div className={cn(
                    "flex-1 min-h-0 bg-white relative overflow-hidden",
                    isEditing && "cursor-crosshair"
                )}>
                    <iframe
                        ref={iframeRef}
                        key={fragmentKey}
                        className="absolute inset-0 h-full w-full border-0"
                        {...(!isEditing && { sandbox: "allow-forms allow-scripts allow-same-origin allow-popups" })}
                        loading={isEditing ? "eager" : "lazy"}
                        src={iframeSrc}
                        title="Sandbox Preview"
                        onLoad={handleIframeLoad}
                    />
                </div>

                {/* Visual Editor Panel (slides in from the right when editing) */}
                {isEditing && (
                    <div className="w-72 shrink-0 border-l bg-background overflow-hidden flex flex-col">
                        <VisualEditorPanel
                            selectedElement={selectedElement}
                            onApplyStyle={handleApplyStyle}
                            onApplyText={handleApplyText}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isSaving={updateFiles.isPending}
                            hasChanges={pendingEdits.length > 0}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}