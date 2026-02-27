import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support | DevFlow',
    description: 'Get help with building, deploying, or fixing your DevFlow projects.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return children;
}
