import { toWavedanceConfig } from "@/defaults"
import { cn } from "@/lib/utils"
import type { Preset } from "@/presets"
import { CanvasHost } from "./CanvasHost"

export function PresetStrip({
  presets,
  selectedId,
  onSelect,
  className,
}: {
  presets: Preset[]
  selectedId: string | null
  onSelect: (preset: Preset) => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-[0.7rem] lowercase tracking-wide text-quiet">other looks</span>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const selected = preset.id === selectedId
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              aria-pressed={selected}
              aria-label={preset.label}
              className={cn(
                "relative size-16 overflow-hidden rounded-xl border transition-colors duration-150",
                selected ? "border-ink" : "border-line hover:border-quiet",
              )}
            >
              <CanvasHost
                config={toWavedanceConfig(preset.state)}
                maxDots={400}
                className="absolute inset-0"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
