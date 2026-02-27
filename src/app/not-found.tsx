import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="rounded-full bg-muted p-4 mb-6">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Page Not Found
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-8">
                We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="default" className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Link>
                </Button>
            </div>
        </div>
    );
}
