import { cn } from "@/lib/utils";

export const BrandIcon = ({ className }: { className?: string }) => (
    <div className={cn("h-8 w-24 bg-muted/50 rounded flex items-center justify-center", className)}>
        <div className="h-3 w-16 bg-muted-foreground/20 rounded-sm" />
    </div>
);
