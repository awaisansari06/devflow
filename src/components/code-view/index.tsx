import Prism from "prismjs";
import { useEffect, useRef, useState } from "react";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

import "./code-theme.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon, SparklesIcon } from "lucide-react";
import { CodeExplanationPanel } from "@/components/code-explanation-panel";
import { useCodeExplanation } from "@/hooks/use-code-explanation";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Hint } from "@/components/hint";

interface Props {
    code: string;
    lang: string;
}

// Language display name mapping
const LANGUAGE_NAMES: Record<string, string> = {
    tsx: "TypeScript React",
    ts: "TypeScript",
    jsx: "JavaScript React",
    js: "JavaScript",
    javascript: "JavaScript",
    typescript: "TypeScript",
    css: "CSS",
    json: "JSON",
    html: "HTML",
    markdown: "Markdown",
    md: "Markdown",
    python: "Python",
    py: "Python",
    bash: "Bash",
    sh: "Shell",
    yaml: "YAML",
    yml: "YAML",
};

export const CodeView = ({
    code,
    lang
}: Props) => {
    const codeRef = useRef<HTMLElement>(null);
    const { copied, copy } = useCopyToClipboard();
    const { explanation, isLoading, explainCode, reset } = useCodeExplanation({ code, language: lang });
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, lang]);

    const displayName = LANGUAGE_NAMES[lang] || lang.toUpperCase();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Language badge + copy button header */}
            <div className="px-4 py-2 border-b bg-muted/50 flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs font-mono">
                    {displayName}
                </Badge>

                <Hint text="Explain code" side="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                            setIsPanelOpen(true);
                            if (!explanation && !isLoading) {
                                explainCode();
                            }
                        }}
                        disabled={isLoading}
                    >
                        <SparklesIcon className={isLoading ? "size-4 animate-spin" : "size-4"} />
                    </Button>
                </Hint>

                <Hint text="Copy code" side="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-7 w-7"
                        onClick={() => copy(code)}
                    >
                        {copied ? (
                            <CheckIcon className="size-4 text-green-500" />
                        ) : (
                            <CopyIcon className="size-4" />
                        )}
                    </Button>
                </Hint>
            </div>

            {/* Code content */}
            <div className="flex-1 overflow-auto p-2 pb-28 md:pb-2 custom-scrollbar">
                <pre className="min-w-fit line-numbers">
                    <code ref={codeRef} className={`language-${lang}`}>{code}</code>
                </pre>
            </div>

            <CodeExplanationPanel
                open={isPanelOpen}
                onClose={() => {
                    setIsPanelOpen(false);
                    reset();
                }}
                explanation={explanation}
                isLoading={isLoading}
            />
        </div>
    );
};