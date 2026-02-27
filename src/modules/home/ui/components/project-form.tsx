"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useClerk } from "@clerk/nextjs";
import { useTypewriter } from "@/hooks/use-typewriter";
import { TemplatePicker } from "./template-picker";

const PLACEHOLDERS = [
    "Ask DevFlow to build a landing page for my...",
    "Ask DevFlow to build a dashboard to...",
    "Ask DevFlow to build an e-commerce site to...",
    "Ask DevFlow to build a portfolio to...",
    "Ask DevFlow to build a blog platform to...",
    "Ask DevFlow to build a web app to...",
];

const formSchema = z.object({
    value: z.string()
        .min(1, { message: "Value is required" })
        .max(10000, { message: "Value is too long" }),
});

export const ProjectForm = ({ userId }: { userId?: string | null }) => {
    const router = useRouter();
    const trpc = useTRPC();
    const clerk = useClerk();
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        },
    });

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            queryClient.invalidateQueries(
                trpc.projects.getMany.queryOptions()
            );
            queryClient.invalidateQueries(
                trpc.usage.status.queryOptions()
            );
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            toast.error(error.message);

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
            if (error.data?.code === "TOO_MANY_REQUESTS") {
                router.push("/pricing");
            }
        },
    }))

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        createProject.mutateAsync({
            value: values.value,
        });
    };

    const onSelect = (value: string) => {
        form.setValue("value", value, {
            shouldDirty: true,
            shouldValidate: true,
            shouldTouch: true,
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const isPending = createProject.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;

    const placeholder = useTypewriter(PLACEHOLDERS);

    return (
        <Form {...form}>
            <section className="space-y-6">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative border border-border/70 bg-card/60 backdrop-blur-md shadow-sm p-4 pt-1 rounded-xl transition-all",
                        isFocused && "shadow-xs ring-1 ring-primary/5",
                    )}
                >
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <TextareaAutosize
                                        {...field}
                                        suppressHydrationWarning
                                        disabled={isPending}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        minRows={2}
                                        maxRows={8}
                                        className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                                        placeholder={placeholder}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                form.handleSubmit(onSubmit)();
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-x-2 items-end justify-between pt-2">
                        <div className="text-[10px] text-muted-foreground font-mono">
                            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1
                        rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                Enter
                            </kbd>
                            &nbsp;to submit
                        </div>
                        <Button
                            disabled={isButtonDisabled}
                            className={cn(
                                "size-8 rounded-full",
                                isButtonDisabled && "bg-muted-foreground border",
                            )}
                        >
                            {isPending ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (

                                <ArrowUpIcon />
                            )}
                        </Button>
                    </div>
                </form>
                {userId && <TemplatePicker onPick={onSelect} userId={userId} />}
            </section>
        </Form>
    );
};


