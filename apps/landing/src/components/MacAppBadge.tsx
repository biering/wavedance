import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

const HREF = "https://wave.dance"

function GridMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={3 + col * 5}
            cy={3 + row * 5}
            r={row === 1 && col === 1 ? 1.7 : 1.25}
            fill="currentColor"
            opacity={row === 1 && col === 1 ? 1 : 0.7}
          />
        )),
      )}
    </svg>
  )
}

export function MacAppBadge({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  if (compact) {
    return (
      <a
        href={HREF}
        target="_blank"
        rel="noreferrer"
        aria-label="get wavedance for mac at wave.dance"
        className={cn(
          "group pointer-events-auto inline-flex items-center gap-3 rounded-2xl bg-ink px-3 py-2 text-ground shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/10 transition-transform duration-150 hover:-translate-y-0.5",
          className,
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-ground text-ink">
          <GridMark className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-[0.7rem] lowercase tracking-tight">wavedance for mac</span>
          <span className="text-[0.6rem] lowercase text-ground/55">live wallpaper</span>
        </span>
        <span className="rounded-full bg-ground px-2 py-0.5 text-[0.6rem] lowercase text-ink">
          get it
        </span>
      </a>
    )
  }

  return (
    <a
      href={HREF}
      target="_blank"
      rel="noreferrer"
      aria-label="get wavedance for mac at wave.dance"
      className={cn(
        "group flex items-start gap-3.5 rounded-2xl bg-ink p-4 text-ground shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition-transform duration-150 hover:-translate-y-0.5",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ground text-ink">
        <GridMark className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm lowercase tracking-tight">wave.dance</span>
          <span className="rounded-full bg-ground/10 px-1.5 py-px text-[0.6rem] lowercase text-ground/70">
            mac app
          </span>
        </span>
        <span className="text-[0.7rem] lowercase leading-relaxed text-ground/60">
          put this grid behind your icons — click-through live wallpaper for every space.
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-[0.7rem] lowercase text-ground">
          get it
          <ArrowUpRight
            size={12}
            className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </span>
    </a>
  )
}
