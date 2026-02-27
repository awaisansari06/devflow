"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useScroll } from "@/hooks/use-scroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/wordmark";
import { MobileMenu } from "./mobile-menu";

export const Navbar = () => {
  const isScrolled = useScroll();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // MOBILE LAYOUT
  if (isMobile) {
    return (
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto w-full h-16 px-4 flex items-center justify-between">
          {/* Mobile Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 sm:h-11">
              <Wordmark className="h-full w-auto" />
            </div>
          </Link>

          {/* Mobile Right: Auth + Menu */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <Button size="sm">Sign in</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserControl showName={false} />
            </SignedIn>

            <MobileMenu />
          </div>
        </div>
      </nav>
    );
  }

  // DESKTOP LAYOUT (FIXED)
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto w-full h-16 px-4 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 sm:h-11">
              <Wordmark className="h-full w-auto" />
            </div>
          </Link>
        </div>

        {/* Center: Pills */}
        <div className="flex-1 flex justify-center min-w-0">
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-1 py-1 text-sm transition-all duration-300",
              "border border-transparent md:hover:border-border/30",
              "bg-transparent md:hover:bg-card/20 md:hover:backdrop-blur-md"
            )}
          >
            {[
              { label: "Docs", href: "/docs" },
              { label: "Support", href: "/support" },
              { label: "Pricing", href: "/pricing" },
              { label: "Analytics", href: "/analytics" },
            ].map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ease-out",
                    "text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground font-semibold"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-secondary/40 dark:bg-white/10 rounded-full -z-10 shadow-[0_0_12px_rgba(255,255,255,0.05)] dark:shadow-[0_0_12px_rgba(255,255,255,0.1)]" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <SignedOut>
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign up
              </Button>
            </SignUpButton>

            <SignInButton>
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserControl showName />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
