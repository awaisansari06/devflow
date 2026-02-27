"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { Logo } from "@/components/logo";

interface Props {
    steps: string[];
}

const ProgressStep = ({
    content,
    isActive,
}: {
    content: string;
    isActive: boolean;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-2 text-sm"
    >
        {isActive ? (
            <LoaderIcon className="size-3.5 animate-spin text-primary shrink-0" />
        ) : (
            <CheckIcon className="size-3.5 text-emerald-500 shrink-0" />
        )}
        <span
            className={
                isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
            }
        >
            {content}
        </span>
    </motion.div>
);

export const MessageLoading = ({ steps }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to latest step
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [steps.length]);

    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Logo width={18} height={18} imageClassName="shrink-0" />
                <span className="text-sm font-medium">DevFlow</span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-1.5" ref={containerRef}>
                <AnimatePresence mode="popLayout">
                    {steps.length === 0 ? (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <LoaderIcon className="size-3.5 animate-spin text-primary shrink-0" />
                            <span>Thinking...</span>
                        </motion.div>
                    ) : (
                        steps.map((step, index) => (
                            <ProgressStep
                                key={`${index}-${step}`}
                                content={step}
                                isActive={index === steps.length - 1}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
