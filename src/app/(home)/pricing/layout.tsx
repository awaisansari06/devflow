import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing | DevFlow',
    description: 'Choose the plan that best fits your needs.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
