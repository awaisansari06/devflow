"use client";

import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Code2Icon, ChevronRightIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { MessageRole, Fragment, MessageType } from "@prisma/client";

import { MessageMarkdown } from "./message-markdown";

interface UserMessageProps {
    content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] wrap-break-word">
                <MessageMarkdown content={content} />
            </Card>
        </div>
    );
}

interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({
    fragment,
    isActiveFragment,
    onFragmentClick
}: FragmentCardProps) => {
    return (
        <button
            className={cn(
                "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
                isActiveFragment &&
                "bg-primary text-primary-foreground border-primary hover:bg-primary",
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-sm">Preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    );
}

interface AssistantMessageProps {
    content: string;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    onAutoFix?: (content: string) => void;
    type: MessageType;
}

const AssistantMessage = ({
    content,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    onAutoFix,
    type
}: AssistantMessageProps) => {

    if (type === "SYSTEM") {
        return (
            <div className="flex items-center gap-2 px-2 pb-4 pl-12 text-sm text-muted-foreground italic">
                <span className="animate-pulse">⏳</span>
                <span>{content}</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type === "ERROR" && "text-destructive",
        )}>
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Logo width={18} height={18} imageClassName="shrink-0" />
                <span className="text-sm font-medium">DevFlow</span>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {format(createdAt, "HH:mm 'on' MMMM dd, yyyy")}
                </span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <MessageMarkdown content={content} />
                {fragment && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragment}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                    />
                )}
                {type === "ERROR" && onAutoFix && (
                    <button
                        onClick={() => onAutoFix(content)}
                        aria-label="Automatically fix this error"
                        className="flex items-center gap-2 border w-fit px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20 font-medium text-sm transition-colors mt-2"
                    >
                        <span>Fix this error ✨</span>
                    </button>
                )}
            </div>

        </div>
    );
}

interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragment: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    onAutoFix?: (content: string) => void;
    type: MessageType;
}

export const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    onAutoFix,
    type
}: MessageCardProps) => {
    if (role === "ASSISTANT") {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                onAutoFix={onAutoFix}
                type={type}
            />
        )
    }

    return (
        <UserMessage content={content} />
    );
};