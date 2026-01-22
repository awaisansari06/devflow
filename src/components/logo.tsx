import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
    imageClassName?: string;
}

export const Logo = ({
    width = 50,
    height = 50,
    className,
    imageClassName,
}: LogoProps) => {
    return (
        <span className={cn("relative flex items-center justify-center shrink-0", className)} style={{ width, height }}>
            <Image
                src="/logo.svg"
                alt="DevFlow"
                width={width}
                height={height}
                className={cn("hidden dark:block", imageClassName)}
            />
            <Image
                src="/logo-light.svg"
                alt="DevFlow"
                width={width}
                height={height}
                className={cn("block dark:hidden", imageClassName)}
            />
        </span>
    );
};
