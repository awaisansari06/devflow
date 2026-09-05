"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { EyeIcon, CodeIcon, CrownIcon, DownloadIcon, MaximizeIcon, MinimizeIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserControl } from "@/components/user-control";
import { Fragment } from "@prisma/client";
import { exportProjectAsZip } from "@/lib/zip-export";
import { toast } from "sonner";
import { Hint } from "@/components/hint";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { FileExplorer } from "@/components/file-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { FragmentWeb } from "../components/fragment-web";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { MessagesContainer } from "@/modules/projects/ui/components/messages-container";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { useTouchDevice } from "@/hooks/use-touch-device";
import { FragmentFiles } from "@/schemas/fragment-files";

interface Props {
    projectId: string;
}



export const ProjectView = ({ projectId }: Props) => {
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: "pro" });
    const isFreeTier = has?.({ plan: "free_user" })

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [mobileTab, setMobileTab] = useState<"chat" | "preview" | "code">("chat");
    const [isExporting, setIsExporting] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleExport = async () => {
        if (!activeFragment?.files) {
            toast.error("No files to export");
            return;
        }

        setIsExporting(true);
        try {
            await exportProjectAsZip(
                projectId || "devflow-project",
                activeFragment.files as any
            );
            toast.success("Project exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Failed to export project");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFilesUpdated = useCallback((updatedFiles: Record<string, string>) => {
        setActiveFragment((prev) => (prev ? { ...prev, files: updatedFiles } : null));
    }, []);

    // Keyboard shortcuts
    useKeyboardShortcut([
        {
            key: "e",
            ctrl: true,
            description: "Export project",
            callback: () => {
                if (activeFragment && !isExporting) {
                    handleExport();
                }
            },
            enabled: !!activeFragment && !isExporting,
        },
        {
            key: "f",
            ctrl: true,
            shift: true,
            description: "Toggle full-screen preview",
            callback: () => {
                if (activeTab === "preview" && activeFragment) {
                    setIsFullScreen(!isFullScreen);
                }
            },
            enabled: activeTab === "preview" && !!activeFragment,
        },
    ]);

    const [isMounted, setIsMounted] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const isTouchDevice = useTouchDevice();

    // Swipe gesture for tab navigation on touch devices
    const swipeRef = useSwipeGesture<HTMLDivElement>({
        onSwipeLeft: () => {
            if (!isTouchDevice || isFullScreen) return;
            if (mobileTab === "chat") setMobileTab("preview");
            else if (mobileTab === "preview") setMobileTab("code");
        },
        onSwipeRight: () => {
            if (!isTouchDevice || isFullScreen) return;
            if (mobileTab === "code") setMobileTab("preview");
            else if (mobileTab === "preview") setMobileTab("chat");
        },
        enabled: !isDesktop,
        threshold: 75,
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <p className="text-muted-foreground animate-pulse">Initializing Workspace...</p>
            </div>
        );
    }

    // Full-screen preview mode
    if (isFullScreen && activeFragment) {
        return (
            <div className="fixed inset-0 z-50 bg-background">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <EyeIcon className="size-4" />
                        <h2 className="font-semibold">Preview - Full Screen</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullScreen(false)}
                        >
                            <MinimizeIcon className="size-4 mr-2" />
                            Exit Full Screen
                        </Button>
                    </div>
                </div>
                <div className="h-[calc(100vh-64px)]">
                    <FragmentWeb
                        data={activeFragment}
                        projectId={projectId}
                        onFilesUpdated={handleFilesUpdated}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen">
            {isDesktop ? (
                <ResizablePanelGroup
                    direction="horizontal"
                >
                    <ResizablePanel
                        defaultSize={35}
                        minSize={20}
                        className="flex flex-col min-h-0"
                    >
                        <ErrorBoundary fallback={<p>project header error</p>}>
                            <Suspense fallback={<p className="p-4">Loading project...</p>}>
                                <ProjectHeader projectId={projectId} />
                            </Suspense>
                        </ErrorBoundary>
                        <ErrorBoundary fallback={<p>messages container error</p>}>
                            <Suspense fallback={<p className="p-4">Loading messages...</p>}>
                                <MessagesContainer
                                    projectId={projectId}
                                    activeFragment={activeFragment}
                                    setActiveFragment={setActiveFragment}
                                />
                            </Suspense>
                        </ErrorBoundary>
                    </ResizablePanel>

                    <ResizableHandle className="hover:bg-primary transition-colors" />

                    <ResizablePanel
                        defaultSize={65}
                        minSize={20}
                    >
                        <Tabs
                            className=" h-full flex flex-col gap-y-0"
                            defaultValue="preview"
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value as "preview" | "code")}
                        >
                            <div className="w-full flex items-center p-2 border-b bg-sidebar shrink-0">
                                <TabsList className="h-8 p-0 border rounded-md">
                                    <TabsTrigger value="preview" className="rounded-md">
                                        <EyeIcon className="size-4 mr-2" /> <span>Demo</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="rounded-md">
                                        <CodeIcon className="size-4 mr-2" /> <span>Code</span>
                                    </TabsTrigger>
                                </TabsList>
                                {activeTab === "preview" && activeFragment && (
                                    <Hint text="Full Screen (Ctrl+Shift+F)" side="bottom">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Toggle full-screen preview"
                                            onClick={() => setIsFullScreen(true)}
                                            className="ml-2 h-8"
                                        >
                                            <MaximizeIcon className="size-4" />
                                        </Button>
                                    </Hint>
                                )}
                                <div className="ml-auto flex items-center gap-x-2">
                                    <Hint text="Export as ZIP (Ctrl+E)" side="bottom">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleExport}
                                            disabled={isExporting || !activeFragment}
                                        >
                                            <DownloadIcon className="size-4 mr-2" />
                                            {isExporting ? "Exporting..." : "Export"}
                                        </Button>
                                    </Hint>
                                    {!hasProAccess && (
                                        <Button asChild size="sm" variant="tertiary">
                                            <Link href="/pricing">
                                                <CrownIcon className="size-4 mr-2" /> Upgrade
                                            </Link>
                                        </Button>
                                    )}
                                    <UserControl />
                                </div>
                            </div>

                            <TabsContent
                                value="preview"
                                className="flex-1 w-full m-0 p-0 overflow-hidden min-h-0 data-[state=inactive]:hidden"
                            >
                                {!!activeFragment && (
                                    <FragmentWeb
                                        data={activeFragment}
                                        projectId={projectId}
                                        onFilesUpdated={handleFilesUpdated}
                                        onFullScreen={() => setIsFullScreen(true)}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent
                                value="code"
                                className="flex-1 w-full m-0 p-0 overflow-hidden min-h-0 data-[state=inactive]:hidden"
                            >
                                {!!activeFragment?.files && (
                                    <FileExplorer
                                        files={activeFragment.files as FragmentFiles}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                </ResizablePanelGroup>
            ) : (
                <div ref={swipeRef} className="fixed inset-0 flex flex-col w-full overflow-hidden bg-background top-0 left-0 right-0 bottom-0 z-50">
                    <Tabs
                        className="flex flex-col h-full w-full"
                        defaultValue="chat"
                        value={mobileTab}
                        onValueChange={(value) => setMobileTab(value as "chat" | "preview" | "code")}
                    >
                        <div className="flex-1 w-full min-h-0 overflow-y-auto relative">
                            <TabsContent value="chat" className="h-full m-0 p-0 flex flex-col data-[state=inactive]:hidden">
                                <ErrorBoundary fallback={<p>project header error</p>}>
                                    <Suspense fallback={<p className="p-4">Loading project...</p>}>
                                        <ProjectHeader projectId={projectId} />
                                    </Suspense>
                                </ErrorBoundary>
                                <ErrorBoundary fallback={<p>messages container error</p>}>
                                    <Suspense fallback={<p className="p-4">Loading messages...</p>}>
                                        <MessagesContainer
                                            projectId={projectId}
                                            activeFragment={activeFragment}
                                            setActiveFragment={setActiveFragment}
                                        />
                                    </Suspense>
                                </ErrorBoundary>
                            </TabsContent>

                            <TabsContent value="preview" className="h-full m-0 p-0 flex flex-col data-[state=inactive]:hidden">
                                <div className="bg-sidebar p-2 flex items-center justify-between border-b shrink-0">
                                    <span className="font-semibold text-sm">Live Preview</span>
                                    <div className="flex items-center gap-x-2">
                                        {!hasProAccess && (
                                            <Button asChild size="sm" variant="tertiary">
                                                <Link href="/pricing">
                                                    <CrownIcon className="size-4 mr-2" /> Upgrade
                                                </Link>
                                            </Button>
                                        )}
                                        <UserControl />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden min-h-0 relative">
                                    {!!activeFragment ? (
                                        <FragmentWeb
                                            data={activeFragment}
                                            projectId={projectId}
                                            onFilesUpdated={handleFilesUpdated}
                                            onFullScreen={() => setIsFullScreen(true)}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
                                            Submit a prompt to start building and see it here.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="code" className="h-full m-0 p-0 flex flex-col data-[state=inactive]:hidden">
                                <div className="bg-sidebar p-2 flex items-center justify-between border-b shrink-0">
                                    <span className="font-semibold text-sm">Code</span>
                                    <div className="flex items-center gap-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleExport}
                                            disabled={isExporting || !activeFragment}
                                        >
                                            <DownloadIcon className="size-4 mr-2" />
                                            {isExporting ? "Exporting..." : "Export"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden min-h-0 relative bg-background">
                                    {!!activeFragment?.files ? (
                                        <FileExplorer
                                            files={activeFragment.files as FragmentFiles}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
                                            Code will appear here once the agent finishes generating.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                        </div>

                        <div className="border-t bg-sidebar p-2 shrink-0 z-10 pb-8 sm:pb-4 shadow-lg w-full">
                            <TabsList className="w-full flex justify-between h-14 bg-transparent rounded-none">
                                <TabsTrigger value="chat" className="flex-1 flex-col gap-1 data-[state=active]:bg-muted rounded-xl h-full shadow-none">
                                    <MessageSquareIcon className="size-5" />
                                    <span className="text-[10px] font-medium">Chat</span>
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex-1 flex-col gap-1 data-[state=active]:bg-muted rounded-xl h-full shadow-none">
                                    <EyeIcon className="size-5" />
                                    <span className="text-[10px] font-medium">Preview</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="flex-1 flex-col gap-1 data-[state=active]:bg-muted rounded-xl h-full shadow-none">
                                    <CodeIcon className="size-5" />
                                    <span className="text-[10px] font-medium">Code</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
            )
            }
        </div >
    );
};