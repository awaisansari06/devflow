"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { Fragment, Message as PrismaMessage } from "@prisma/client";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { MessageLoading } from "./message-loading";

type MessageWithFragment = PrismaMessage & { fragment: Fragment | null };

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

function computeAgentStatus(msgs: MessageWithFragment[]): { lastUserIdx: number; completed: boolean; isWorking: boolean } {
    const lastUserIdx = msgs.findLastIndex(m => m.role === "USER");
    const completed = msgs.slice(lastUserIdx + 1).some(m => m.type === "RESULT" || m.type === "ERROR");
    const isWorking = lastUserIdx === msgs.length - 1 || (lastUserIdx >= 0 && !completed);
    return { lastUserIdx, completed, isWorking };
}

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastAutoSelectedId = useRef<string | null>(null);
    const queryClient = useQueryClient();

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId: projectId,
    }, {
        // Poll faster (2s) while the agent is actively working, 5s otherwise
        refetchInterval: (query): number => {
            const data = query.state.data as MessageWithFragment[] | undefined;
            if (!data || data.length === 0) return 5000;
            const { isWorking } = computeAgentStatus(data);
            return isWorking ? 1000 : 5000;
        },
    }));

    const { lastUserIdx, completed: statusCompleted } = useMemo(
        () => computeAgentStatus(messages),
        [messages]
    );

    const createMessage = useMutation(trpc.messages.createMessage.mutationOptions({
        onSuccess: () => {
            queryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({ projectId })
            );
        },
        onError: (error) => {
            toast.error(error.message);
        },
    }));

    const handleAutoFix = (errorContent: string) => {
        const prompt = `Please fix this error:\n\`\`\`\n${errorContent}\n\`\`\``;
        createMessage.mutate({
            value: prompt,
            projectId,
            isAutoFix: true,
        });
    };

    useEffect(() => {
        const lastAssistantMessageWithFragment = messages.findLast(
            (message) => message.role === "ASSISTANT" && message.fragment,
        );

        const newestFragment = lastAssistantMessageWithFragment?.fragment;

        if (newestFragment && newestFragment.id !== lastAutoSelectedId.current) {
            setActiveFragment(newestFragment);
            lastAutoSelectedId.current = newestFragment.id;
        }
    }, [messages, setActiveFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";
    const isAgentWorking = lastUserIdx >= 0 && !statusCompleted;

    // Collect active SYSTEM messages (progress steps) since the last user message
    const activeSystemMessages = useMemo(() => {
        if (!isAgentWorking) return [];
        return messages
            .slice(lastUserIdx + 1)
            .filter(m => m.type === "SYSTEM" || m.type === "LOG")
            .map(m => m.content);
    }, [messages, lastUserIdx, isAgentWorking]);

    const visibleMessages = messages.filter((message, index) => {
        if (message.type === "SYSTEM" || message.type === "LOG") {
            if (index < lastUserIdx) return false;
            if (statusCompleted) return false;
            // Hide SYSTEM messages from the main list — they're shown in MessageLoading
            if (isAgentWorking) return false;
        }
        return true;
    });

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {visibleMessages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragment={message.fragment}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                            onFragmentClick={() => setActiveFragment(message.fragment)}
                            onAutoFix={handleAutoFix}
                            type={message.type}
                        />
                    ))}
                    {isAgentWorking && <MessageLoading steps={activeSystemMessages} />}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-linear-to-b from-transparent to-background/70 pointer-events-none" />
                <MessageForm projectId={projectId} />
            </div>
        </div>
    );
};