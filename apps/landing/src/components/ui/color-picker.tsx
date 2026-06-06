"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
