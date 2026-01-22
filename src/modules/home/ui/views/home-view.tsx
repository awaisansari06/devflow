"use client";

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsSection } from "@/modules/home/ui/components/projects-section";
import { Sparkles, BrainCircuit, Zap } from "lucide-react";
import { MotionDiv, pageVariants, itemVariants } from "@/components/motion";
import { FAQ } from "@/components/faq";

export const HomeView = ({ userId }: { userId: string | null }) => {
    return (
        <div className="relative">
            <MotionDiv
                className="relative z-10 flex flex-col max-w-5xl mx-auto w-full"
                variants={pageVariants}
                initial="hidden"
                animate="show"
            >
                {/* Soft glow behind (Replicated from Docs) */}
                <div className="pointer-events-none absolute left-1/2 top-28 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl -z-10 dark:bg-primary/15" />

                <section className="space-y-6 pt-20 pb-8 md:pt-24">
                    {/* Badge */}
                    <MotionDiv variants={itemVariants} className="flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-4 py-2 text-xs text-muted-foreground">
                            <span className="text-primary">⚡</span>
                            Build apps faster with AI
                        </div>
                    </MotionDiv>

                    {/* Title */}
                    <MotionDiv variants={itemVariants}>
                        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-center">
                            Build something with{" "}
                            <span className="text-primary italic">DevFlow</span>
                        </h1>
                    </MotionDiv>

                    {/* Subtitle */}
                    <MotionDiv variants={itemVariants}>
                        <p className="mt-4 text-base md:text-lg text-foreground/70 text-center">
                            Create apps and websites by chatting with AI
                        </p>
                    </MotionDiv>

                    {/* Form */}
                    <MotionDiv variants={itemVariants} className="max-w-3xl mx-auto w-full">
                        <ProjectForm />
                    </MotionDiv>

                    {/* Features */}
                    <MotionDiv
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto pt-8"
                    >
                        {[
                            {
                                icon: <Sparkles className="h-5 w-5 text-primary" />,
                                title: "AI Projects",
                                description: "Build full-stack apps with just a prompt",
                            },
                            {
                                icon: <BrainCircuit className="h-5 w-5 text-primary" />,
                                title: "Smart Templates",
                                description: "Start from best-practice architectures",
                            },
                            {
                                icon: <Zap className="h-5 w-5 text-primary" />,
                                title: "Instant Deploy",
                                description: "Go from idea to live URL in minutes",
                            },
                        ].map((feature, i) => (
                            <MotionDiv
                                key={i}
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-5 hover:bg-card hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.25)] transition"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </MotionDiv>
                        ))}
                    </MotionDiv>
                </section>

                {/* Projects List */}
                {userId && (
                    <MotionDiv variants={itemVariants}>
                        <ProjectsSection />
                    </MotionDiv>
                )}

                {/* FAQ */}
                <MotionDiv variants={itemVariants}>
                    <FAQ />
                </MotionDiv>
            </MotionDiv>
        </div>
    );
};
