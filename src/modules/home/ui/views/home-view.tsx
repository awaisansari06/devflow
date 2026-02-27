"use client";

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsSection } from "@/modules/home/ui/components/projects-section";
import { Sparkles, BrainCircuit, Zap } from "lucide-react";
import { MotionDiv, pageVariants, itemVariants } from "@/components/motion";
import { FAQ } from "@/components/faq";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

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
                    {/* Badge with Pricing Hint */}
                    <MotionDiv variants={itemVariants} className="flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur px-4 py-2 text-xs text-muted-foreground">
                            <span className="text-primary">⚡</span>
                            Build apps faster with AI
                            <span className="text-border">•</span>
                            <span className="text-primary font-medium">Free to start</span>
                        </div>
                    </MotionDiv>

                    {/* Title */}
                    <MotionDiv variants={itemVariants}>
                        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-center">
                            Build something with{" "}
                            <span className="text-primary italic">DevFlow</span>
                        </h1>
                    </MotionDiv>

                    {/* Subtitle with Emotional Hook */}
                    <MotionDiv variants={itemVariants} className="space-y-2">
                        <p className="text-base md:text-lg text-foreground/70 text-center">
                            Create apps and websites by chatting with AI
                        </p>
                        <p className="text-sm md:text-base text-primary/80 text-center font-medium">
                            From idea to deployed app in minutes.
                        </p>
                    </MotionDiv>

                    {/* Form with CTA */}
                    <MotionDiv variants={itemVariants} className="max-w-3xl mx-auto w-full space-y-4">
                        <ProjectForm userId={userId} />

                        {/* Primary CTA - Only show when not logged in */}
                        {!userId && (
                            <div className="flex flex-col items-center gap-3 pt-2">
                                <SignInButton mode="modal">
                                    <Button
                                        size="lg"
                                        className="gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Start Building Free
                                    </Button>
                                </SignInButton>

                                {/* Subtle secondary CTA */}
                                <SignInButton mode="modal">
                                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                                        Start building for free
                                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                    </button>
                                </SignInButton>
                            </div>
                        )}
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

                {/* Visual Break - Gradient Divider */}
                <MotionDiv variants={itemVariants} className="py-12">
                    <div className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
                </MotionDiv>

                {/* Why DevFlow Section */}
                <MotionDiv variants={itemVariants} className="py-8 pb-16">
                    <div className="text-center space-y-8 max-w-3xl mx-auto px-4">
                        <h2 className="text-2xl md:text-3xl font-semibold">Why DevFlow?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                            <div className="space-y-3">
                                <div className="text-lg">⚡</div>
                                <div className="font-semibold text-primary">Lightning Fast</div>
                                <p className="text-muted-foreground leading-relaxed">
                                    From idea to deployed app in minutes, not days
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="text-lg">🎯</div>
                                <div className="font-semibold text-primary">Production Ready</div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Generate clean, maintainable code you can actually use
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="text-lg">🔒</div>
                                <div className="font-semibold text-primary">Your Code, Your Control</div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Full access to source code, deploy anywhere
                                </p>
                            </div>
                        </div>
                    </div>
                </MotionDiv>

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
