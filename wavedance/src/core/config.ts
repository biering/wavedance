import type { GapConfig, ResolvedWavedanceConfig, WavedanceConfig } from "../types"
import { normalizeHexColor } from "./color"

const DEFAULT_GAP = 10
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

  return {
    dotSize: config.dotSize ?? DEFAULT_DOT_SIZE,
    gap,
    foreground: normalizeHexColor(config.foreground ?? "#7c7c7c"),
    foregroundOpacity: clampOpacity(config.foregroundOpacity),
    background: normalizeHexColor(config.background ?? "#161616"),
    backgroundOpacity: clampOpacity(config.backgroundOpacity),
    animation: config.animation ?? "wave",
    wave: {
      scale: config.wave?.scale ?? 0.01,
      speed: config.wave?.speed ?? 0.001,
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
    devicePixelRatio:
      config.devicePixelRatio ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    maxDots: config.maxDots ?? 100_000,
    respectReducedMotion: config.respectReducedMotion ?? true,
  }
}
