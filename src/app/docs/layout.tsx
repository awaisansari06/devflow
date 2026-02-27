import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Documentation | DevFlow',
    description: 'Master the art of AI-driven development. Learn how to use DevFlow to build production-ready applications.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
