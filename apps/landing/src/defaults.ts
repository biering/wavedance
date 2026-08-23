import type { AnimationType, WavedanceConfig } from "wavedance"
import type { ToneName } from "./lib/tone"

export const defaultControlsState = {
  dotSize: 1,
  dotSizeVariation: 0.3,
  gap: 8,
  hue: 0.65,
  foreground: "#7c7c7c",
  foregroundTone: null as ToneName | null,
  foregroundOpacity: 1,
  background: "#161616",
  backgroundTone: null as ToneName | null,
  backgroundOpacity: 1,
  animation: "wave" as AnimationType,
  waveScale: 0.01,
  waveSpeed: 0.001,
  waveThreshold: 0.25,
  waveSoftness: 0.4,
  randomSpeed: 0.8,
  plasmaScale: 0.004,
  plasmaSpeed: 0.0003,
  plasmaThreshold: 0.15,
  plasmaSoftness: 0.5,
  arcSpeed: 1,
  arcCenter: 0.4,
  arcDrop: 0.9,
  arcThickness: 0.35,
  arcCurve: 1.8,
  ribbonSpeed: 1,
  ribbonAmplitude: 0.2,
  ribbonThickness: 1,
  ribbonSpread: 1,
  ribbonFade: 0.25,
  secondaryForegroundColor: "",
}

export type ControlsState = typeof defaultControlsState

export function toWavedanceConfig(state: ControlsState): WavedanceConfig {
  return {
    dotSize: state.dotSize,
    dotSizeVariation: state.dotSizeVariation,
    gap: state.gap,
    foreground: state.foreground,
    foregroundOpacity: state.foregroundOpacity,
    secondaryForegroundColor: state.secondaryForegroundColor || undefined,
    background: state.background,
    backgroundOpacity: state.backgroundOpacity,
    animation: state.animation,
    wave: {
      scale: state.waveScale,
      speed: state.waveSpeed,
      threshold: state.waveThreshold,
      softness: state.waveSoftness,
    },
    random: {
      speed: state.randomSpeed,
    },
    plasma: {
      scale: state.plasmaScale,
      speed: state.plasmaSpeed,
      threshold: state.plasmaThreshold,
      softness: state.plasmaSoftness,
    },
    arc: {
      speed: state.arcSpeed,
      center: state.arcCenter,
      drop: state.arcDrop,
      thickness: state.arcThickness,
      curve: state.arcCurve,
    },
    ribbon: {
      speed: state.ribbonSpeed,
      amplitude: state.ribbonAmplitude,
      thickness: state.ribbonThickness,
      spread: state.ribbonSpread,
      fade: state.ribbonFade,
    },
  }
}

export const defaultWavedanceConfig = toWavedanceConfig(defaultControlsState)

function compactConfig(state: ControlsState): Record<string, unknown> {
  const config: Record<string, unknown> = {
    dotSize: state.dotSize,
    dotSizeVariation: state.dotSizeVariation,
    gap: state.gap,
    foreground: state.foreground,
    ...(state.secondaryForegroundColor
      ? { secondaryForegroundColor: state.secondaryForegroundColor }
      : {}),
    background: state.background,
    animation: state.animation,
  }

  if (state.animation === "wave") {
    config.wave = {
      scale: state.waveScale,
      speed: state.waveSpeed,
      threshold: state.waveThreshold,
      softness: state.waveSoftness,
    }
  } else if (state.animation === "random") {
    config.random = { speed: state.randomSpeed }
  } else if (state.animation === "plasma") {
    config.plasma = {
      scale: state.plasmaScale,
      speed: state.plasmaSpeed,
      threshold: state.plasmaThreshold,
      softness: state.plasmaSoftness,
    }
  } else if (state.animation === "arc") {
    config.arc = {
      speed: state.arcSpeed,
      center: state.arcCenter,
      drop: state.arcDrop,
      thickness: state.arcThickness,
      curve: state.arcCurve,
    }
  } else if (state.animation === "ribbon") {
    config.ribbon = {
      speed: state.ribbonSpeed,
      amplitude: state.ribbonAmplitude,
      thickness: state.ribbonThickness,
      spread: state.ribbonSpread,
      fade: state.ribbonFade,
    }
  }

  return config
}

function formatValue(value: unknown, indent: number): string {
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return "{}"
    const pad = " ".repeat(indent)
    const inner = " ".repeat(indent + 2)
    return `{\n${entries.map(([key, nested]) => `${inner}${key}: ${formatValue(nested, indent + 2)},`).join("\n")}\n${pad}}`
  }
  return String(value)
}

export function formatSnippet(state: ControlsState): string {
  return `import { createWavedance } from "wavedance";

createWavedance(container, ${formatValue(compactConfig(state), 0)});`
}
