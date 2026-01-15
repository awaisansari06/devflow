import Prism from "prismjs";
import { useEffect } from "react";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";

import "./code-theme.css";

interface Props {
    code: string;
    lang: string;
}

export const CodeView = ({
    code,
    lang
}: Props) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    return (
        <div className="flex-1 overflow-auto p-2 custom-scrollbar">
            <pre className="min-w-fit">
                <code className={`language-${lang}`}>{code}</code>
            </pre>
        </div>
    );
};