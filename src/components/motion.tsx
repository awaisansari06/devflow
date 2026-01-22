"use client";

import { motion } from "framer-motion";

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionH1 = motion.h1;
export const MotionP = motion.p;

export const pageVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
} as const;

export const itemVariants = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
} as const;
