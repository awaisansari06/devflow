import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

export const metadata: Metadata = {
  title: "DevFlow",
  description: "Build web apps with AI",
  icons: "/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#9b2c2c",
        },
      }}
    >
      <TRPCReactProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased min-h-screen w-full overflow-x-hidden bg-transparent`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Base Color Layer */}
              <div className="fixed inset-0 -z-50 bg-background" />

              {/* Full page dots (reduced visibility + better in light/dark) */}
              <div
                className="
                  fixed inset-0 -z-10
                  bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)]
                  [background-size:24px_24px]
                  opacity-[0.08]
                  dark:opacity-[0.06]
                "
              />

              {/* Soft overlay (makes dots feel less harsh / more premium) */}
              <div className="fixed inset-0 -z-10 bg-background/40 dark:bg-background/20" />

              {/* Soft glow */}
              <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary),transparent_60%)] opacity-10" />

              <Toaster />
              {children}
            </ThemeProvider>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
