import { Metadata } from 'next';

type Props = {
    params: {
        projectId: string;
    };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Project Workspace | DevFlow`,
        description: 'Your AI-powered development environment.',
    };
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    return children;
}
