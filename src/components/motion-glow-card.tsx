"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionGlowCardProps = HTMLMotionProps<"div"> & {
    className?: string;
    children: React.ReactNode;
};

export function MotionGlowCard({ className, children, ...props }: MotionGlowCardProps) {
    return (
        <motion.div
            {...props}
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border",
                "bg-card/70 backdrop-blur",
                "border-border/60",
                "shadow-sm transition",
                "hover:bg-card",
                // dark mode shadow glow boost
                "hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_20px_60px_-25px_hsl(var(--primary)/0.55)]",
                className
            )}
        >
            {/* 🔥 Glow (works in dark mode too) */}
            <div
                className={cn(
                    "pointer-events-none absolute -inset-20 opacity-0 transition duration-300",
                    "group-hover:opacity-100",
                    // stronger glow
                    "bg-[radial-gradient(220px_circle_at_30%_20%,hsl(var(--primary)/0.30),transparent_65%)]"
                )}
            />

            {/* subtle border glow ring */}
            <div
                className={cn(
                    "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300",
                    "group-hover:opacity-100",
                    "ring-1 ring-inset ring-primary/20"
                )}
            />

            <div className="relative">{children}</div>
        </motion.div>
    );
}
