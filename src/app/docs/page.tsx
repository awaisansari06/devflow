"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    BookOpen,
    Rocket,
    Wand2,
    Terminal,
    Shield,
    LayoutDashboard,
    Sparkles,
    ArrowRight,
} from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

const cardHover =
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/20";

const docsContent = {
    quickStart: [
        {
            icon: <Wand2 className="h-4 w-4 text-primary" />,
            title: "1. Prompt it",
            desc: "Describe your app: 'A CRM for dentists with appointment scheduling'.",
        },
        {
            icon: <Terminal className="h-4 w-4 text-primary" />,
            title: "2. Edit it",
            desc: "DevFlow generates Next.js & Tailwind code. You can refine the UI instantly.",
        },
        {
            icon: <Rocket className="h-4 w-4 text-primary" />,
            title: "3. Ship it",
            desc: "Deploy your full-stack app (with Prisma DB) to Vercel in one click.",
        },
    ],
    guides: [
        {
            icon: <LayoutDashboard className="h-5 w-5 text-primary" />,
            title: "Clone Templates",
            desc: "Start fast with pre-built clones: YouTube, Spotify, Airbnb, and more.",
        },
        {
            icon: <Sparkles className="h-5 w-5 text-primary" />,
            title: "AI Prompting",
            desc: "Learn how to ask for complex features like 'dark mode' or 'Stripe payments'.",
        },
        {
            icon: <Shield className="h-5 w-5 text-primary" />,
            title: "Auth (Clerk)",
            desc: "Secure your app with user authentication using our Clerk integration.",
        },
        {
            icon: <Terminal className="h-5 w-5 text-primary" />,
            title: "Database (Prisma)",
            desc: "Manage your Postgres data with Prisma ORM schema and migrations.",
        },
    ],
    faq: [
        {
            q: "What stack does DevFlow use?",
            a: "DevFlow generates apps using Next.js (App Router), Tailwind CSS, Shadcn UI, Prisma (Postgres), and Clerk for auth.",
        },
        {
            q: "Can I export the code?",
            a: "Yes! You own 100% of the code. You can download it, push to GitHub, and deploy anywhere.",
        },
        {
            q: "Is the database included?",
            a: "Yes, we provision a Postgres database for your project automatically using Neon or similar providers.",
        },
    ],
};

export default function DocsPage() {
    return (
        <div className="relative w-full">
            {/* Soft glow behind */}
            <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl -z-10 dark:bg-primary/15" />

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-col max-w-5xl mx-auto w-full px-4 pb-16"
            >
                {/* Header */}
                <motion.div variants={fadeUp} className="pt-16 md:pt-24 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-4 py-2 text-xs text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        Documentation
                    </div>

                    <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">
                        DevFlow Docs
                    </h1>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Master the art of AI-driven development. Build faster with prompts.
                    </p>
                </motion.div>

                {/* Quick start */}
                <motion.div
                    variants={fadeUp}
                    className="mt-10 rounded-3xl border bg-card/70 backdrop-blur p-6 md:p-8"
                >
                    <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center">
                            <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold">Quick Start</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                From idea to deployed app in 3 steps.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {docsContent.quickStart.map((x, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl border bg-background/50 p-5 ${cardHover}`}
                            >
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    {x.icon}
                                    {x.title}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{x.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Guides */}
                <motion.div variants={fadeUp} className="mt-10">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Feature Guides</h2>
                        <Link
                            href="/"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                            Back to Home <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {docsContent.guides.map((g, i) => (
                            <div
                                key={i}
                                className={`rounded-3xl border bg-card/70 backdrop-blur p-6 ${cardHover}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center">
                                        {g.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{g.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {g.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div
                    variants={fadeUp}
                    className="mt-10 rounded-3xl border bg-card/70 backdrop-blur p-6 md:p-8"
                >
                    <h2 className="text-xl font-semibold">Technical FAQ</h2>

                    <div className="mt-4 space-y-3">
                        {docsContent.faq.map((item, idx) => (
                            <details
                                key={idx}
                                className="group rounded-2xl border bg-background/40 px-5 py-4"
                            >
                                <summary className="cursor-pointer list-none font-medium flex items-center justify-between">
                                    <span>{item.q}</span>
                                    <span className="text-muted-foreground group-open:rotate-180 transition">
                                        ▾
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    variants={fadeUp}
                    className="mt-10 text-center text-sm text-muted-foreground"
                >
                    Need help? Visit{" "}
                    <Link href="/support" className="text-primary hover:underline">
                        Support
                    </Link>{" "}
                    anytime.
                </motion.p>
            </motion.div>
        </div>
    );
}
