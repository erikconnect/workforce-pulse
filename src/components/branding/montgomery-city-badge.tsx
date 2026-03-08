import Image from "next/image"
import { cn } from "@/lib/utils"

type BadgeSize = "sm" | "md" | "lg"
type BadgeTone = "default" | "muted" | "inverse"

interface MontgomeryCityBadgeProps {
  className?: string
  size?: BadgeSize
  tone?: BadgeTone
  compact?: boolean
}

const sizeClasses: Record<BadgeSize, { wrap: string; iconWrap: string; icon: number; title: string; subtitle: string }> = {
  sm: {
    wrap: "gap-2.5 rounded-full px-3 py-2",
    iconWrap: "h-8 w-8",
    icon: 32,
    title: "text-[10px] tracking-[0.18em]",
    subtitle: "text-[9px]",
  },
  md: {
    wrap: "gap-3 rounded-full px-3.5 py-2.5",
    iconWrap: "h-11 w-11",
    icon: 44,
    title: "text-[11px] tracking-[0.2em]",
    subtitle: "text-[10px]",
  },
  lg: {
    wrap: "gap-3.5 rounded-full px-4 py-3",
    iconWrap: "h-14 w-14",
    icon: 56,
    title: "text-[12px] tracking-[0.22em]",
    subtitle: "text-[11px]",
  },
}

const toneClasses: Record<BadgeTone, string> = {
  default: "border-primary/15 bg-white/60 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] dark:border-primary/20 dark:bg-white/8 dark:text-white",
  muted: "border-primary/10 bg-white/38 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-primary/15 dark:bg-white/5 dark:text-white/70",
  inverse: "border-white/20 bg-[rgba(0,46,61,0.38)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
}

export function MontgomeryCityBadge({
  className,
  size = "sm",
  tone = "default",
  compact = false,
}: MontgomeryCityBadgeProps) {
  const config = sizeClasses[size]

  return (
    <div
      className={cn(
        "inline-flex items-center border backdrop-blur-xl",
        config.wrap,
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("relative shrink-0 overflow-hidden rounded-full ring-1 ring-primary/20 dark:ring-primary/25", config.iconWrap)}>
        <Image
          src="/images/city-logo.png"
          alt="City of Montgomery, Alabama"
          width={config.icon}
          height={config.icon}
          className="h-full w-full object-contain"
        />
      </span>
      {!compact ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className={cn("font-semibold uppercase", config.title)}>City of Montgomery</span>
          <span className={cn("mt-0.5", config.subtitle)}>Alabama</span>
        </span>
      ) : null}
    </div>
  )
}