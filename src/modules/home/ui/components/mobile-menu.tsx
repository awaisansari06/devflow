"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, BookText, Headset, CreditCard, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/wordmark";

const navLinks = [
    { label: "Docs", href: "/docs", icon: BookText },
    { label: "Support", href: "/support", icon: Headset },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
];

export const MobileMenu = () => {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-2 rounded-full bg-secondary/50">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="top"
                className="rounded-b-4xl pt-12 pb-8 px-6 bg-background/95 backdrop-blur-xl border-b border-border shadow-xl"
            >
                <SheetHeader className="mb-8">
                    <SheetTitle className="flex justify-center">
                        <Wordmark className="h-8 w-auto" />
                    </SheetTitle>
                </SheetHeader>
                <div className="flex justify-between items-start gap-2 max-w-sm mx-auto">
                    {navLinks.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");

                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-2 transition-transform active:scale-95 group",
                                )}
                            >
                                <div className={cn(
                                    "h-14 w-14 rounded-full border border-border flex items-center justify-center transition-all shadow-sm",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                                )}>
                                    <Icon className="size-6" strokeWidth={1.5} />
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold tracking-tight transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                {/* Visual drag handle indicator at the bottom */}
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-8 opacity-50" />
            </SheetContent>
        </Sheet>
    );
};
