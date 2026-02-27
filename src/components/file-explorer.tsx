import { useState, useMemo, useCallback, Fragment } from "react";

import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems, cn } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useEffect } from "react";

import { FragmentFiles } from "@/schemas/fragment-files";

function getLanguageFromExtension(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension || "text";
};

interface FileExplorerProps {
    files: FragmentFiles;
};

interface FileBreadcrumbProps {
    filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
    const pathSegments = filePath.split("/")
    const maxSegments = 4;

    const renderBreadcrumbItems = () => {
        if (pathSegments.length <= maxSegments) {
            // Show all segments if 4 or less
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;

                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage className="font-medium">
                                    {segment}
                                </BreadcrumbPage>
                            ) : (
                                <span className="text-muted-foreground">
                                    {segment}
                                </span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            })
        } else {
            const firstSegment = pathSegments[0];
            const lastSegment = pathSegments[pathSegments.length - 1];

            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">
                            {firstSegment}
                        </span>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">
                            {lastSegment}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </>
            )
        }
    };

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {renderBreadcrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export const FileExplorer = ({
    files,
}: FileExplorerProps) => {
    const [openedFiles, setOpenedFiles] = useState<string[]>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? [fileKeys[0]] : [];
    });
    const [activeFile, setActiveFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });
    const [open, setOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Load sidebar preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("file-explorer-sidebar-collapsed");
        if (saved) setIsSidebarCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem("file-explorer-sidebar-collapsed", JSON.stringify(newState));
    };

    // Keyboard shortcut for sidebar toggle
    useKeyboardShortcut({
        key: "b",
        ctrl: true,
        description: "Toggle file explorer sidebar",
        callback: toggleSidebar,
    });

    const treeData = useMemo(() => {
        return convertFilesToTreeItems(files);
    }, [files]);

    const handleFileSelect = useCallback((
        filePath: string
    ) => {
        if (files[filePath]) {
            setOpenedFiles((prev) => {
                if (!prev.includes(filePath)) {
                    return [...prev, filePath];
                }
                return prev;
            });
            setActiveFile(filePath);
            setOpen(false);
        }
    }, [files]);

    const handleCloseTab = (e: React.MouseEvent, filePath: string) => {
        e.stopPropagation();
        setOpenedFiles((prev) => {
            const newOpenedFiles = prev.filter(f => f !== filePath);

            if (activeFile === filePath) {
                if (newOpenedFiles.length > 0) {
                    setActiveFile(newOpenedFiles[newOpenedFiles.length - 1]);
                } else {
                    setActiveFile(null);
                }
            }
            return newOpenedFiles;
        });
    };

    const SidebarContent = (
        <div className="h-full w-full">
            <TreeView
                data={treeData}
                value={activeFile}
                onSelect={handleFileSelect}
            />
        </div>
    );

    const MainContent = (
        <div className="h-full w-full flex flex-col min-w-0 bg-background">
            <div className="flex bg-sidebar overflow-x-auto w-full border-b shrink-0 no-scrollbar relative pt-1 px-1">
                {!isDesktop && (
                    <div className="sticky left-0 z-10 bg-sidebar pb-1 pr-2 rounded-r-md flex items-center shrink-0">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 shadow-sm">
                                    <MenuIcon className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                                <SheetHeader className="px-4 py-2 border-b">
                                    <SheetTitle className="text-sm">Files</SheetTitle>
                                </SheetHeader>
                                <div className="p-0 h-full overflow-y-auto">
                                    {SidebarContent}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                )}

                <div className="flex gap-x-px h-9 shrink-0 flex-1 w-full min-w-0">
                    {openedFiles.map((file) => {
                        const basename = file.split("/").pop() || "file";
                        const isActive = activeFile === file;
                        return (
                            <button
                                key={file}
                                onClick={() => setActiveFile(file)}
                                className={cn(
                                    "group flex items-center gap-x-2 px-3 h-full max-w-[200px] text-xs transition-colors border-x border-t border-transparent shrink-0",
                                    isActive
                                        ? "bg-background border-border text-foreground font-medium -mb-px rounded-t-md z-10"
                                        : "bg-muted/30 text-muted-foreground hover:bg-muted rounded-t-sm"
                                )}
                            >
                                <span className="truncate pointer-events-none">{basename}</span>
                                <div
                                    className={cn(
                                        "p-0.5 rounded-sm hover:bg-muted-foreground/20 text-transparent transition-colors",
                                        isActive ? "text-muted-foreground hover:text-foreground" : "group-hover:text-muted-foreground"
                                    )}
                                    onClick={(e) => handleCloseTab(e, file)}
                                    title={`Close ${basename}`}
                                >
                                    <XIcon className="size-3 pointer-events-none" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 flex min-h-0 flex-col bg-background relative w-full">
                {activeFile && files[activeFile] ? (
                    <CodeView
                        code={files[activeFile]}
                        lang={getLanguageFromExtension(activeFile)}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-2">
                        <p className="text-sm font-medium">No file is open</p>
                        <p className="text-xs">Select a file from the sidebar to view its contents.</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
                    {SidebarContent}
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel defaultSize={70} minSize={50}>
                    {MainContent}
                </ResizablePanel>
            </ResizablePanelGroup>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {MainContent}
        </div>
    );
};