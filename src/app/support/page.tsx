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
    Activity,
} from "lucide-react";

import { FAQ } from "@/components/faq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <motion.div variants={fadeUp} className="rounded-3xl border bg-card/70 backdrop-blur p-6 md:p-8">
                        <h2 className="text-xl font-semibold">Send a Message</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Fill out the form below and our team will get back to you within 24 hours.
                        </p>
                        <form className="mt-6 space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            toast.success("Message sent! We'll get back to you shortly.");
                            (e.target as HTMLFormElement).reset();
                        }}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" required placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" required placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" required placeholder="How can we help?" className="min-h-[120px] resize-y" />
                            </div>
                            <Button type="submit" className="w-full">
                                Send Message
                            </Button>
                        </form>
                    </motion.div>

                    {/* Support options */}
                    <motion.div variants={stagger} className="grid grid-cols-1 gap-4">
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
                                icon: <Activity className="h-5 w-5 text-primary" />,
                                title: "System Status",
                                desc: "Check real-time uptime of API and Agent generation pipelines.",
                                action: "status.devflow.com",
                                href: "#",
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
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {x.icon}
                                            <h3 className="font-semibold">{x.title}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">{x.desc}</p>
                                        <div className="mt-3 inline-flex items-center gap-2 text-sm text-primary font-medium">
                                            {x.action} <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </motion.div>
                </div>

                {/* FAQ */}
                <motion.div variants={fadeUp} className="mt-16">
                    <FAQ />
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
