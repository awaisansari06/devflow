import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <svg
      className={cn("block h-full w-auto", className)}
      viewBox="0 0 190 44"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-label="DevFlow"
      role="img"
    >
      <defs>
        {/* Gradient uses theme variables so it works in light + dark */}
        <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--foreground)" />
          <stop offset="55%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>

      {/* Icon Badge (adapts) */}
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="12"
        fill="var(--card)"
      />

      {/* Terminal Window */}
      <rect
        x="12"
        y="14"
        width="20"
        height="16"
        rx="5"
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth="2"
      />

      {/* Prompt */}
      <path
        d="M16 20L19 22L16 24"
        stroke="var(--foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M21 24H27"
        stroke="var(--primary)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Spark */}
      <circle cx="30" cy="14" r="2.4" fill="var(--primary)" />
      <circle cx="30" cy="14" r="6" fill="var(--primary)" fillOpacity="0.14" />

      {/* Wordmark Text: DevFlow (no gap) */}
      <text
        x="56"
        y="29"
        fontFamily="Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        fontSize="19"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.4px"
        fill="var(--foreground)"
      >
        Dev
        <tspan fill="url(#flowGradient)">Flow</tspan>
      </text>

    </svg>
  );
}
