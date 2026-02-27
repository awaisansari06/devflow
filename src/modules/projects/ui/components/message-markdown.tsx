"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
// Depending on how you want to style it, you might need to import a Prism CSS theme globally or here.
// e.g. import "prismjs/themes/prism-tomorrow.css";

interface MessageMarkdownProps {
    content: string;
}

export const MessageMarkdown = ({ content }: MessageMarkdownProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        {children}
                    </a>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-bold mb-2 mt-4">{children}</h4>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-4">
                        {children}
                    </blockquote>
                ),
                code(props) {
                    const { children, className, node, ref, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    const [isCopied, setIsCopied] = useState(false);

                    const handleCopy = () => {
                        if (typeof children === "string") {
                            navigator.clipboard.writeText(children);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                        }
                    };

                    const isInline = !match && !String(children).includes("\n");

                    if (isInline) {
                        return (
                            <code {...rest} className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm">
                                {children}
                            </code>
                        );
                    }

                    const language = match ? match[1] : "text";
                    let highlightedCode = String(children);

                    if (Prism.languages[language]) {
                        highlightedCode = Prism.highlight(String(children), Prism.languages[language], language);
                    }

                    return (
                        <div className="relative group my-4 rounded-lg overflow-hidden border bg-[#1e1e1e]">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                                <span className="text-xs font-mono text-gray-400">{language}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10"
                                    onClick={handleCopy}
                                >
                                    {isCopied ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
                                    <span className="sr-only">Copy code</span>
                                </Button>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <pre className="bg-transparent! m-0! p-0!">
                                    <code
                                        className={`language-${language} text-sm`}
                                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                    />
                                </pre>
                            </div>
                        </div>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
};
