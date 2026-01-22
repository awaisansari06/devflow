"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Github, MessageCircle } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FaqProps = {
    className?: string;
};

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
};

export function FAQ({ className }: FaqProps) {
    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("w-full pt-0 pb-2", className)}
        >
            <div className="max-w-3xl mx-auto">
                {/* Heading */}
                <div className="mb-6 text-center">
                    <p className="text-sm text-muted-foreground">FAQ</p>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        Questions, answered.
                    </h2>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground">
                        Everything you need to know before building with DevFlow.
                    </p>
                </div>

                {/* Accordion */}
                <div className="rounded-2xl border bg-card/70 backdrop-blur p-2">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b">
                            <AccordionTrigger className="px-4">
                                What does DevFlow generate?
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-muted-foreground">
                                DevFlow can generate full-stack app structure like pages,
                                components, layouts, forms, and database-ready logic depending on
                                your prompt. You can start from templates or your own idea.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border-b">
                            <AccordionTrigger className="px-4">
                                Can I edit the code?
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-muted-foreground">
                                Yes. The built-in code editor lets you modify the UI, logic, and database schema directly in the browser.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-b">
                            <AccordionTrigger className="px-4">
                                Is it free?
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-muted-foreground">
                                You can start for free. Some advanced features like higher usage or premium templates may be part of a paid plan later.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border-b-0">
                            <AccordionTrigger className="px-4">
                                What technologies are used?
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-muted-foreground">
                                DevFlow generates apps using modern stack: Next.js 14, Tailwind CSS, Shadcn UI, and Lucide Icons.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Support CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                    className="mt-8 rounded-2xl border bg-card/60 backdrop-blur px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div>
                        <p className="text-sm text-muted-foreground">Need help?</p>
                        <h3 className="text-base md:text-lg font-semibold">
                            Contact support anytime
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            We’re happy to help you build, deploy, or fix anything.
                        </p>
                    </div>

                    <Link href="/support">
                        <Button className="gap-2 rounded-xl">
                            Contact support <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Footer Links */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} DevFlow. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/docs"
                            className="inline-flex items-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
                        >
                            <BookOpen className="h-4 w-4" />
                            Docs
                        </Link>

                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Discord
                        </a>

                        <a
                            href="https://github.com/awaisansari06"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
                        >
                            <Github className="h-4 w-4" />
                            GitHub
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}
