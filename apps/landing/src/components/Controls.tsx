import { ColorPicker, ColorPresets } from "@/components/ui/color-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { ControlsState } from "@/defaults"
import { toneHex } from "@/lib/tone"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import type { AnimationType } from "wavedance"

export interface ControlsProps {
  state: ControlsState
  onChange: (state: ControlsState) => void
  className?: string
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.75rem] lowercase text-quiet">{label}</span>
        <span className="font-mono text-[0.7rem] text-quiet/60">{format(value)}</span>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? value)}
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b border-line pb-2 text-[0.7rem] tracking-wide lowercase text-quiet">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Controls({ state, onChange, className }: ControlsProps) {
  const update = (partial: Partial<ControlsState>) => {
    onChange({ ...state, ...partial })
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-[320px] max-w-[360px] flex-col gap-6 rounded-2xl border border-line bg-raised p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-sm lowercase tracking-tight text-ink">wavedance</h1>
        <p className="text-[0.7rem] lowercase text-quiet">animated dot-grid canvas background</p>
      </div>

      <Section title="grid">
        <SliderField
          label="dot size"
          value={state.dotSize}
          min={1}
          max={6}
          step={1}
          format={(value) => `${value}px`}
          onChange={(dotSize) => update({ dotSize })}
        />

        <SliderField
          label="size variation"
          value={state.dotSizeVariation}
          min={0}
          max={1}
          step={0.05}
          format={(value) => value.toFixed(2)}
          onChange={(dotSizeVariation) => update({ dotSizeVariation })}
        />

        <SliderField
          label="gap"
          value={state.gap}
          min={4}
          max={32}
          step={2}
          format={(value) => `${value}px`}
          onChange={(gap) => update({ gap })}
        />
      </Section>

      <Section title="color">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.75rem] lowercase text-quiet">foreground</span>
          <ColorPicker
            value={state.foreground}
            onChange={(foreground) => update({ foreground, foregroundTone: null })}
          />
          <ColorPresets
            label="foreground"
            hue={state.hue}
            selected={state.foregroundTone}
            onChange={(foreground, foregroundTone) => update({ foreground, foregroundTone })}
          />
        </div>

        {state.animation !== "random" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.75rem] lowercase text-quiet">color 2</span>
              {state.secondaryForegroundColor ? (
                <button
                  type="button"
                  className="text-[0.65rem] lowercase text-quiet/70 transition-colors hover:text-ink"
                  onClick={() => update({ secondaryForegroundColor: "" })}
                >
                  remove
                </button>
              ) : (
                <button
                  type="button"
                  className="text-[0.65rem] lowercase text-quiet/70 transition-colors hover:text-ink"
                  onClick={() => update({ secondaryForegroundColor: "#a855f7" })}
                >
                  add
                </button>
              )}
            </div>
            {state.secondaryForegroundColor ? (
              <ColorPicker
                value={state.secondaryForegroundColor}
                onChange={(secondaryForegroundColor) => update({ secondaryForegroundColor })}
              />
            ) : (
              <p className="text-[0.65rem] lowercase text-quiet/50">
                single color — add a second for a two-tone field
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-[0.75rem] lowercase text-quiet">background</span>
          <ColorPicker
            value={state.background}
            onChange={(background) => update({ background, backgroundTone: null })}
          />
          <ColorPresets
            label="background"
            hue={state.hue}
            selected={state.backgroundTone}
            onChange={(background, backgroundTone) => update({ background, backgroundTone })}
          />
        </div>

        <SliderField
          label="hue"
          value={state.hue}
          min={0}
          max={0.999}
          step={0.001}
          format={(value) => value.toFixed(3)}
          onChange={(hue) => {
            const next: Partial<ControlsState> = { hue }
            if (state.foregroundTone) next.foreground = toneHex(hue, state.foregroundTone)
            if (state.backgroundTone) next.background = toneHex(hue, state.backgroundTone)
            update(next)
          }}
        />
      </Section>

      <Section title="animation">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.75rem] lowercase text-quiet">type</span>
          <Select
            value={state.animation}
            onValueChange={(animation) => update({ animation: animation as AnimationType })}
          >
            <SelectTrigger className="h-8 w-full border-line bg-transparent shadow-none dark:bg-transparent dark:hover:bg-line/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wave">wave</SelectItem>
              <SelectItem value="random">random</SelectItem>
              <SelectItem value="plasma">plasma</SelectItem>
              <SelectItem value="arc">arc</SelectItem>
              <SelectItem value="ribbon">ribbon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state.animation === "wave" && (
          <>
            <SliderField
              label="wave scale"
              value={state.waveScale}
              min={0.002}
              max={0.05}
              step={0.001}
              format={(value) => value.toFixed(3)}
              onChange={(waveScale) => update({ waveScale })}
            />
            <SliderField
              label="wave speed"
              value={state.waveSpeed}
              min={0.0001}
              max={0.005}
              step={0.0001}
              format={(value) => value.toFixed(4)}
              onChange={(waveSpeed) => update({ waveSpeed })}
            />
            <SliderField
              label="threshold"
              value={state.waveThreshold}
              min={0}
              max={0.9}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(waveThreshold) => update({ waveThreshold })}
            />
            <SliderField
              label="softness"
              value={state.waveSoftness}
              min={0.05}
              max={0.5}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(waveSoftness) => update({ waveSoftness })}
            />
          </>
        )}

        {state.animation === "random" && (
          <SliderField
            label="transition speed"
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
              label="plasma scale"
              value={state.plasmaScale}
              min={0.002}
              max={0.02}
              step={0.001}
              format={(value) => value.toFixed(3)}
              onChange={(plasmaScale) => update({ plasmaScale })}
            />
            <SliderField
              label="plasma speed"
              value={state.plasmaSpeed}
              min={0.0001}
              max={0.002}
              step={0.0001}
              format={(value) => value.toFixed(4)}
              onChange={(plasmaSpeed) => update({ plasmaSpeed })}
            />
            <SliderField
              label="threshold"
              value={state.plasmaThreshold}
              min={0}
              max={0.8}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(plasmaThreshold) => update({ plasmaThreshold })}
            />
            <SliderField
              label="softness"
              value={state.plasmaSoftness}
              min={0.05}
              max={0.5}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(plasmaSoftness) => update({ plasmaSoftness })}
            />
          </>
        )}

        {state.animation === "arc" && (
          <>
            <SliderField
              label="speed"
              value={state.arcSpeed}
              min={0.1}
              max={3}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(arcSpeed) => update({ arcSpeed })}
            />
            <SliderField
              label="center"
              value={state.arcCenter}
              min={0.1}
              max={0.9}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(arcCenter) => update({ arcCenter })}
            />
            <SliderField
              label="drop"
              value={state.arcDrop}
              min={0.1}
              max={1.5}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(arcDrop) => update({ arcDrop })}
            />
            <SliderField
              label="thickness"
              value={state.arcThickness}
              min={0.05}
              max={0.8}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(arcThickness) => update({ arcThickness })}
            />
            <SliderField
              label="curve"
              value={state.arcCurve}
              min={1}
              max={4}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(arcCurve) => update({ arcCurve })}
            />
          </>
        )}

        {state.animation === "ribbon" && (
          <>
            <SliderField
              label="speed"
              value={state.ribbonSpeed}
              min={0.1}
              max={3}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(ribbonSpeed) => update({ ribbonSpeed })}
            />
            <SliderField
              label="amplitude"
              value={state.ribbonAmplitude}
              min={0.05}
              max={0.45}
              step={0.01}
              format={(value) => value.toFixed(2)}
              onChange={(ribbonAmplitude) => update({ ribbonAmplitude })}
            />
            <SliderField
              label="thickness"
              value={state.ribbonThickness}
              min={0.4}
              max={3}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(ribbonThickness) => update({ ribbonThickness })}
            />
            <SliderField
              label="spread"
              value={state.ribbonSpread}
              min={0.4}
              max={1.8}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(ribbonSpread) => update({ ribbonSpread })}
            />
            <SliderField
              label="fade"
              value={state.ribbonFade}
              min={0}
              max={1}
              step={0.05}
              format={(value) => value.toFixed(2)}
              onChange={(ribbonFade) => update({ ribbonFade })}
            />
          </>
        )}
      </Section>

      <a
        href="https://www.npmjs.com/package/wavedance"
        target="_blank"
        rel="noreferrer"
        className="text-quiet hover:text-ink text-xs lowercase transition-colors duration-150"
      >
        npm
      </a>
    </div>
  )
}
