import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ColorPicker } from "@/components/ui/color-picker"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { AnimationType, WavedanceConfig } from "wavedance"
import { useState } from "react"
import { defaultControlsState } from "../defaults"

export interface ControlsProps {
  onChange: (config: Partial<WavedanceConfig>) => void
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{format(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? value)}
      />
    </div>
  )
}

export function Controls({ onChange }: ControlsProps) {
  const [state, setState] = useState(defaultControlsState)

  const emit = (next: typeof defaultControlsState) => {
    setState(next)
    onChange({
      dotSize: next.dotSize,
      gap: next.gap,
      foreground: next.foreground,
      foregroundOpacity: next.foregroundOpacity,
      background: next.background,
      backgroundOpacity: next.backgroundOpacity,
      animation: next.animation,
      wave: {
        scale: next.waveScale,
        speed: next.waveSpeed,
      },
      random: {
        speed: next.randomSpeed,
      },
      plasma: {
        scale: next.plasmaScale,
        speed: next.plasmaSpeed,
        threshold: next.plasmaThreshold,
        softness: next.plasmaSoftness,
      },
    })
  }

  const update = (partial: Partial<typeof defaultControlsState>) => {
    emit({ ...state, ...partial })
  }

  return (
    <Card className="w-full min-w-[320px] max-w-[360px] border-border/60 bg-card/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">wavedance</CardTitle>
        <CardDescription>Animated dot-grid canvas background</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SliderField
          label="Dot size"
          value={state.dotSize}
          min={1}
          max={6}
          step={1}
          format={(value) => `${value}px`}
          onChange={(dotSize) => update({ dotSize })}
        />

        <SliderField
          label="Gap"
          value={state.gap}
          min={4}
          max={32}
          step={2}
          format={(value) => `${value}px`}
          onChange={(gap) => update({ gap })}
        />

        <div className="space-y-2">
          <Label>Foreground</Label>
          <ColorPicker value={state.foreground} onChange={(foreground) => update({ foreground })} />
        </div>

        <SliderField
          label="Foreground opacity"
          value={state.foregroundOpacity}
          min={0}
          max={1}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(foregroundOpacity) => update({ foregroundOpacity })}
        />

        <div className="space-y-2">
          <Label>Background</Label>
          <ColorPicker value={state.background} onChange={(background) => update({ background })} />
        </div>

        <SliderField
          label="Background opacity"
          value={state.backgroundOpacity}
          min={0}
          max={1}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(backgroundOpacity) => update({ backgroundOpacity })}
        />

        <div className="space-y-2">
          <Label>Animation</Label>
          <Select
            value={state.animation}
            onValueChange={(animation) => update({ animation: animation as AnimationType })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="plasma">Plasma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state.animation === "wave" && (
          <>
            <SliderField
              label="Wave scale"
              value={state.waveScale}
              min={0.002}
              max={0.05}
              step={0.001}
              format={(value) => value.toFixed(3)}
              onChange={(waveScale) => update({ waveScale })}
            />
            <SliderField
              label="Wave speed"
              value={state.waveSpeed}
              min={0.0001}
              max={0.005}
              step={0.0001}
              format={(value) => value.toFixed(4)}
              onChange={(waveSpeed) => update({ waveSpeed })}
            />
          </>
        )}

        {state.animation === "random" && (
          <SliderField
            label="Transition speed"
            value={state.randomSpeed}
            min={0.1}
            max={2}
            step={0.1}
            format={(value) => value.toFixed(1)}
            onChange={(randomSpeed) => update({ randomSpeed })}
          />
        )}

        {state.animation === "plasma" && (
          <>
            <SliderField
              label="Plasma scale"
              value={state.plasmaScale}
              min={0.002}
              max={0.02}
              step={0.001}
              format={(value) => value.toFixed(3)}
              onChange={(plasmaScale) => update({ plasmaScale })}
            />
            <SliderField
              label="Plasma speed"
              value={state.plasmaSpeed}
              min={0.0001}
              max={0.002}
              step={0.0001}
              format={(value) => value.toFixed(4)}
              onChange={(plasmaSpeed) => update({ plasmaSpeed })}
            />
            <SliderField
              label="Threshold"
              value={state.plasmaThreshold}
              min={0}
              max={0.8}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(plasmaThreshold) => update({ plasmaThreshold })}
            />
            <SliderField
              label="Softness"
              value={state.plasmaSoftness}
              min={0.05}
              max={0.5}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(plasmaSoftness) => update({ plasmaSoftness })}
            />
          </>
        )}

        <a
          href="https://www.npmjs.com/package/wavedance"
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-primary hover:underline"
        >
          npm
        </a>
      </CardContent>
    </Card>
  )
}
