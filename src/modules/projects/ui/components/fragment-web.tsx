import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Fragment } from "@prisma/client";
import { useTRPC } from "@/trpc/client";
import { getVisualEditorScript } from "@/lib/visual-editor-inject";
import { generatePatches, type VisualEdit } from "@/lib/visual-editor-patcher";
import { VisualEditorPanel } from "./visual-editor-panel";
import { PreviewToolbar } from "./preview-toolbar";
import { PreviewIframe } from "./preview-iframe";

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
    projectId?: string;
    onFilesUpdated?: (updatedFiles: Record<string, string>) => void;
    onFullScreen?: () => void;
}

export const FragmentWeb = ({ data, projectId, onFilesUpdated }: Props) => {
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
    };

    const handleCopy = () => {
        if (!data.sandboxUrl) return;
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    // ─── postMessage Communication ────────────────────────────
    const postToIframe = useCallback((msg: Record<string, unknown>) => {
        if (!iframeRef.current?.contentWindow) return;

        let targetOrigin = "*";
        if (isEditing) {
            targetOrigin = window.location.origin;
        } else if (data.sandboxUrl) {
            try {
                targetOrigin = new URL(data.sandboxUrl).origin;
            } catch {
                targetOrigin = "*";
            }
        }

        iframeRef.current.contentWindow.postMessage(msg, targetOrigin);
    }, [isEditing, data.sandboxUrl]);

    const handleApplyStyle = useCallback((property: string, value: string) => {
        postToIframe({ type: "apply-style", property, value });
        setPendingEdits((prev) => {
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
            onSuccess: (updatedFragment) => {
                toast.success("Visual changes saved!");
                setPendingEdits([]);
                setSelectedElement(null);
                setIsEditing(false);
                setFragmentKey((prev) => prev + 1);

                if (onFilesUpdated && updatedFragment?.files) {
                    onFilesUpdated(updatedFragment.files as Record<string, string>);
                }

                if (projectId) {
                    queryClient.invalidateQueries(
                        trpc.messages.getMany.queryOptions({ projectId })
                    );
                }
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
        setFragmentKey((prev) => prev + 1);
    }, []);

    // ─── Compute iframe src ───────────────────────────────────
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
            setFragmentKey((prev) => prev + 1);
        } else {
            setIsEditing(true);
            setFragmentKey((prev) => prev + 1);
        }
    }, [isEditing, postToIframe, pendingEdits]);

    // ─── Listen for Messages from Iframe ──────────────────────
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            const allowedOrigins = new Set<string>();
            if (typeof window !== "undefined") {
                allowedOrigins.add(window.location.origin);
            }
            if (data.sandboxUrl) {
                try {
                    allowedOrigins.add(new URL(data.sandboxUrl).origin);
                } catch {
                    // Ignore invalid url
                }
            }

            if (!allowedOrigins.has(e.origin)) return;

            const msg = e.data;
            if (!msg || typeof msg !== "object" || !msg.type) return;

            if (msg.type === "element-selected") {
                setSelectedElement(msg.data);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [data.sandboxUrl]);

    // Inject editor script when iframe loads in edit mode
    const handleIframeLoad = useCallback(() => {
        if (isEditing) {
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
            <PreviewToolbar
                sandboxUrl={data.sandboxUrl}
                isEditing={isEditing}
                copied={copied}
                onRefresh={onRefresh}
                onCopy={handleCopy}
                onToggleEditMode={toggleEditMode}
                onOpenExternal={() => {
                    if (data.sandboxUrl) window.open(data.sandboxUrl, "_blank");
                }}
            />

            <div className="flex flex-1 w-full min-h-0 overflow-hidden">
                <PreviewIframe
                    ref={iframeRef}
                    fragmentKey={fragmentKey}
                    isEditing={isEditing}
                    src={iframeSrc}
                    onLoad={handleIframeLoad}
                />

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
    );
};