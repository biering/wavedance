export { createWavedance } from "./wavedance"
export { buildGrid } from "./core/grid"
export { SimplexNoise, smoothstep } from "./core/noise"
export { parseHexColor, normalizeHexColor } from "./core/color"
export { resolveConfig } from "./core/config"
export type {
  AnimationType,
  GapConfig,
  WaveAnimationOptions,
  RandomAnimationOptions,
  PlasmaAnimationOptions,
  WavedanceConfig,
  ResolvedWavedanceConfig,
  WavedanceInstance,
  GridLayout,
  DrawOptions,
} from "./types"
export type { Renderer } from "./render/renderer"
export { Canvas2DRenderer } from "./render/canvas2d"
