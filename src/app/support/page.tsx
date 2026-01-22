"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    LifeBuoy,
    Mail,
    MessageSquare,
    Bug,
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

export default function SupportPage() {
    return (
        <div className="relative w-full">
            {/* Soft glow */}
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
                        <LifeBuoy className="h-4 w-4" />
                        Support
                    </div>

                    <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">
                        Contact Support
                    </h1>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                        We’re happy to help you build, deploy, or fix anything — fast.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl border bg-card/70 backdrop-blur px-4 py-2 text-sm hover:bg-card transition"
                        >
                            Back to Home <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            href="/docs"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition"
                        >
                            View Docs <Sparkles className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Support options */}
                <motion.div variants={fadeUp} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: <Mail className="h-5 w-5 text-primary" />,
                            title: "Email us",
                            desc: "Best for billing, account issues, or private requests.",
                            action: "support@devflow.com",
                            href: "mailto:support@devflow.com",
                        },
                        {
                            icon: <MessageSquare className="h-5 w-5 text-primary" />,
                            title: "Community",
                            desc: "Ask questions, share builds, get feedback from others.",
                            action: "Join Discord",
                            href: "https://discord.gg/",
                        },
                        {
                            icon: <Bug className="h-5 w-5 text-primary" />,
                            title: "Report a bug",
                            desc: "Found something broken? Send steps + screenshots.",
                            action: "Open GitHub Issue",
                            href: "https://github.com/",
                        },
                    ].map((x, i) => (
                        <a
                            key={i}
                            href={x.href}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-3xl border bg-card/70 backdrop-blur p-6 ${cardHover}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center">
                                    {x.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">{x.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{x.desc}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium">
                                        {x.action} <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </motion.div>

                {/* FAQ */}
                <motion.div
                    variants={fadeUp}
                    className="mt-10 rounded-3xl border bg-card/70 backdrop-blur p-6 md:p-8"
                >
                    <h2 className="text-xl font-semibold">Support FAQ</h2>

                    <div className="mt-4 space-y-3">
                        {[
                            {
                                q: "My generated app isn't working, what do I do?",
                                a: "Try refining your prompt. Be specific about features. If it persists, check the 'console' for errors and report a bug with the prompt ID.",
                            },
                            {
                                q: "How do I deploy to Vercel?",
                                a: "Push your code to GitHub, then import the repo in Vercel. Ensure you add the necessary environment variables (DATABASE_URL, CLERK_keys).",
                            },
                            {
                                q: "Can I use my own database?",
                                a: "Yes. In your `schema.prisma`, you can update the provider and url to point to any Postgres database, like Supabase or Railway.",
                            },
                        ].map((item, idx) => (
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
                <motion.p
                    variants={fadeUp}
                    className="mt-10 text-center text-sm text-muted-foreground"
                >
                    You can also reach us from inside your dashboard anytime.
                </motion.p>
            </motion.div>
        </div>
    );
}
