"use client";

import { Suspense, useState, useEffect } from "react";
import { EyeIcon, CodeIcon, CrownIcon, DownloadIcon, MaximizeIcon, MinimizeIcon } from "lucide-react";
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
            if (activeTab === "preview") setActiveTab("code");
        },
        onSwipeRight: () => {
            if (!isTouchDevice || isFullScreen) return;
            if (activeTab === "code") setActiveTab("preview");
        },
        enabled: !isDesktop && !!activeFragment,
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
                    <FragmentWeb data={activeFragment} />
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
                <div className="flex flex-col w-full h-dvh overflow-y-auto scroll-smooth">
                    {/* Chat Section */}
                    <div className="min-h-dvh flex flex-col w-full shrink-0">
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
                    </div>

                    {/* Gap between Chat and Live Preview */}
                    <div className="h-5 w-full bg-background shrink-0" />

                    {/* Sandbox Section */}
                    <div ref={swipeRef} className="min-h-dvh flex flex-col w-full shrink-0 bg-background border-t">
                        <div className="bg-sidebar p-2 text-center font-semibold text-sm border-b shrink-0 sticky top-0 z-10">
                            Live Preview
                        </div>
                        <Tabs
                            className="h-full flex flex-col gap-y-0"
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
                                <div className="ml-auto flex items-center gap-x-2">
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
                    </div>
                </div>
            )
            }
        </div >
    );
};