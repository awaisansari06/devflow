import { CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, useCallback, Fragment } from "react";

import { Hint } from "@/components/hint";
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
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

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
    const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });
    const [open, setOpen] = useState(false);

    const isDesktop = useMediaQuery("(min-width: 768px)");

    const treeData = useMemo(() => {
        return convertFilesToTreeItems(files);
    }, [files]);

    const handleFileSelect = useCallback((
        filePath: string
    ) => {
        if (files[filePath]) {
            setSelectedFile(filePath);
            setOpen(false);
        }
    }, [files]);

    const handleCopy = useCallback(() => {
        if (selectedFile) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files]);

    const SidebarContent = (
        <div className="h-full w-full">
            <TreeView
                data={treeData}
                value={selectedFile}
                onSelect={handleFileSelect}
            />
        </div>
    );

    const MainContent = (
        <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex items-center gap-x-2">
                {!isDesktop && (
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                                <MenuIcon className="size-4 mr-2" />
                                Files
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
                            <SheetHeader className="px-4 py-2 border-b">
                                <SheetTitle className="text-sm">Files</SheetTitle>
                            </SheetHeader>
                            <div className="p-0 h-full overflow-y-auto">
                                {SidebarContent}
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
                {selectedFile && <FileBreadcrumb filePath={selectedFile} />}
                <Hint text="Copy to clipboard" side="bottom">
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-auto"
                        onClick={handleCopy}
                        disabled={copied}
                    >
                        {copied ? <CopyCheckIcon /> : <CopyIcon />}
                    </Button>
                </Hint>
            </div>

            <div className="flex-1 flex min-h-0 flex-col">
                {selectedFile && files[selectedFile] ? (
                    <CodeView
                        code={files[selectedFile]}
                        lang={getLanguageFromExtension(selectedFile)}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view its content
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