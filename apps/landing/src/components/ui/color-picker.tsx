"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { COLOR_TONES, type ToneName, toneHex } from "@/lib/tone"
import { cn } from "@/lib/utils"
import Color from "color"
import { useMemo, useState } from "react"
import { HexColorPicker } from "react-colorful"

function normalizeHex(value: string): string {
  try {
    return Color(value).hex().toLowerCase()
  } catch {
    return "#000000"
  }
}

export interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export interface ColorPresetsProps {
  hue: number
  selected: ToneName | null
  onChange: (hex: string, name: ToneName) => void
  label: string
}

export function ColorPicker({ value, onChange, className, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const parsed = useMemo(() => normalizeHex(value), [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("h-9 w-full justify-start gap-2 px-2", className)}
        >
          <span
            className="size-5 shrink-0 rounded-sm border border-border"
            style={{ backgroundColor: parsed }}
          />
          <span className="font-mono text-xs text-muted-foreground">{parsed}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <HexColorPicker
          color={parsed}
          onChange={(next) => onChange(normalizeHex(next))}
          className="!w-full"
        />
        <Input
          className="mt-3 font-mono text-xs"
          value={parsed}
          onChange={(event) => {
            const next = event.target.value
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(next)) {
              onChange(normalizeHex(next))
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function ColorPresets({ hue, selected, onChange, label }: ColorPresetsProps) {
  return (
    <fieldset className="m-0 flex flex-wrap gap-1 border-0 p-0">
      <legend className="sr-only">{label} presets</legend>
      {COLOR_TONES.map((tone) => (
        <Chip
          key={tone.name}
          label={tone.name}
          swatch={toneHex(hue, tone.name)}
          selected={selected === tone.name}
          onClick={() => onChange(toneHex(hue, tone.name), tone.name)}
        />
      ))}
    </fieldset>
  )
}

function Chip({
  label,
  swatch,
  selected,
  onClick,
}: {
  label: string
  swatch: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "border-line inline-flex items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-1.5",
        "text-[0.65rem] lowercase transition-colors duration-150",
        selected ? "bg-line/70 text-ink" : "text-quiet hover:bg-line/30 hover:text-ink",
      )}
    >
      <span
        aria-hidden="true"
        className="size-3 rounded-full ring-1 ring-ink/15"
        style={{ background: swatch }}
      />
      {selected && (
        <span aria-hidden="true" className="text-[0.6rem] leading-none text-ink/70">
          ✓
        </span>
      )}
      {label}
    </button>
  )
}
