"use client";

import { Suspense, useState, useEffect } from "react";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserControl } from "@/components/user-control";
import { Fragment } from "@prisma/client";
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

    const [isMounted, setIsMounted] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

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
                                {!!activeFragment && <FragmentWeb data={activeFragment} />}
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
                    <div className="min-h-dvh flex flex-col w-full shrink-0 bg-background border-t">
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
                                {!!activeFragment && <FragmentWeb data={activeFragment} />}
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