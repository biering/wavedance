import type { GapConfig, ResolvedWavedanceConfig, WavedanceConfig } from "../types"
import { normalizeHexColor } from "./color"

const DEFAULT_GAP = 8
const DEFAULT_DOT_SIZE = 1

export function clampOpacity(value: number | undefined, fallback = 1): number {
  if (value === undefined) {
    return fallback
  }
  return Math.min(1, Math.max(0, value))
}

export function resolveGap(gap: number | GapConfig | undefined): GapConfig {
  if (gap === undefined) {
    return { x: DEFAULT_GAP, y: DEFAULT_GAP }
  }
  if (typeof gap === "number") {
    return { x: gap, y: gap }
  }
  return { x: gap.x, y: gap.y }
}

export function resolveConfig(config: WavedanceConfig = {}): ResolvedWavedanceConfig {
  const gap = resolveGap(config.gap)

  // Bound the auto-detected DPR: on 3× displays an uncapped backing store is 9×
  // the pixels to clear/fill every frame. An explicit devicePixelRatio opts out.
  const maxDevicePixelRatio = config.maxDevicePixelRatio ?? 2
  const autoDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  return {
    dotSize: config.dotSize ?? DEFAULT_DOT_SIZE,
    dotSizeVariation: clampOpacity(config.dotSizeVariation, 0.3),
    gap,
    foreground: normalizeHexColor(config.foreground ?? "#7c7c7c"),
    secondaryForegroundColor: config.secondaryForegroundColor
      ? normalizeHexColor(config.secondaryForegroundColor)
      : "",
    foregroundOpacity: clampOpacity(config.foregroundOpacity),
    background: normalizeHexColor(config.background ?? "#161616"),
    backgroundOpacity: clampOpacity(config.backgroundOpacity),
    animation: config.animation ?? "wave",
    wave: {
      scale: config.wave?.scale ?? 0.01,
      speed: config.wave?.speed ?? 0.001,
      threshold: config.wave?.threshold ?? 0.25,
      softness: config.wave?.softness ?? 0.4,
    },
    random: {
      speed: config.random?.speed ?? 0.8,
      minOpacity: config.random?.minOpacity ?? 0.05,
      maxOpacity: config.random?.maxOpacity ?? 1,
      seed: config.random?.seed ?? 42,
    },
    plasma: {
      scale: config.plasma?.scale ?? 0.004,
      speed: config.plasma?.speed ?? 0.0003,
      threshold: config.plasma?.threshold ?? 0.15,
      softness: config.plasma?.softness ?? 0.5,
      seed: config.plasma?.seed ?? 42,
    },
    arc: {
      speed: config.arc?.speed ?? 1,
      center: config.arc?.center ?? 0.4,
      drop: config.arc?.drop ?? 0.9,
      thickness: config.arc?.thickness ?? 0.35,
      curve: config.arc?.curve ?? 1.8,
      falloff: config.arc?.falloff ?? 2.5,
      breathe: config.arc?.breathe ?? 0.1,
    },
    ribbon: {
      speed: config.ribbon?.speed ?? 1,
      amplitude: config.ribbon?.amplitude ?? 0.2,
      thickness: config.ribbon?.thickness ?? 1,
      spread: config.ribbon?.spread ?? 1,
      fade: clampOpacity(config.ribbon?.fade, 0.25),
      bloom: clampOpacity(config.ribbon?.bloom, 0.5),
    },
    devicePixelRatio: config.devicePixelRatio ?? Math.min(autoDpr, maxDevicePixelRatio),
    maxDevicePixelRatio,
    maxDots: config.maxDots ?? 100_000,
    respectReducedMotion: config.respectReducedMotion ?? true,
  }
}
