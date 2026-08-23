import { Slider as SliderPrimitive } from "radix-ui"
import * as React from "react"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": label,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "group relative flex h-4 w-full touch-none items-center select-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-35",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative w-full grow rounded-full bg-line",
          "data-[orientation=horizontal]:h-[3px] data-[orientation=vertical]:h-full data-[orientation=vertical]:w-[3px]",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute rounded-full bg-quiet data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional, not reorderable
          key={index}
          aria-label={label}
          className={cn(
            "block size-3.5 shrink-0 rounded-full border-2 border-ground bg-ink shadow-sm",
            "transition-[background-color,box-shadow] duration-150",
            "hover:ring-4 hover:ring-line focus-visible:ring-4 focus-visible:ring-line focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
