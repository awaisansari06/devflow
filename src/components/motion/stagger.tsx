"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Stagger({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={cn(className)}
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.05,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

export function FadeUp({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={cn(className)}
            variants={{
                hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
                show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.45, ease: "easeOut" },
                },
            }}
        >
            {children}
        </motion.div>
    );
}
