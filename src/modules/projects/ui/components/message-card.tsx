import { MessageRole, Fragment, MessageType } from "@/generated/prisma/client";
import { Card } from "@/components/ui/card";

interface UserMessageProps {
    content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none dorder-nonde max-w-[80%] break-words">
                {content}
            </Card>
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
    type: MessageType;
}

export const MessageCard = ({
    content,
    role,
    fragment,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type
}: MessageCardProps) => {
    if (role === "ASSISTANT") {
        return (
            <p>ASSISTANT</p>
        )
    }

    return (
        <UserMessage content={content} />
    );
};