export type AnimationType = "none" | "random" | "wave"

export interface GapConfig {
  x: number
  y: number
}

export interface WaveAnimationOptions {
  /** Noise sampling scale. Lower = larger clusters. Default: 0.008 */
  scale?: number
  /** Animation speed multiplier. Default: 0.0004 */
  speed?: number
  /** Lower edge of smoothstep threshold. Default: 0.35 */
  threshold?: number
  /** Width of the fade transition. Default: 0.25 */
  softness?: number
  /** Noise seed for deterministic output. Default: 42 */
  seed?: number
}

export interface RandomAnimationOptions {
  /** Opacity transition speed (0-1 per second). Default: 0.8 */
  speed?: number
  /** Minimum target opacity. Default: 0.05 */
  minOpacity?: number
  /** Maximum target opacity. Default: 1 */
  maxOpacity?: number
  /** RNG seed for deterministic output. Default: 42 */
  seed?: number
}

export interface WavedanceConfig {
  /** Dot diameter in CSS pixels. Default: 2 */
  dotSize?: number
  /** Gap between dots in CSS pixels (symmetric or per-axis). Default: 12 */
  gap?: number | GapConfig
  /** Dot color as hex string. Default: "#7c7c7c" */
  foreground?: string
  /** Dot opacity multiplier (0–1). Default: 1 */
  foregroundOpacity?: number
  /** Canvas background color as hex string. Default: "#161616" */
  background?: string
  /** Background opacity (0–1). Default: 1 */
  backgroundOpacity?: number
  /** Animation mode. Default: "wave" */
  animation?: AnimationType
  /** Wave animation options */
  wave?: WaveAnimationOptions
  /** Random animation options */
  random?: RandomAnimationOptions
  /** Device pixel ratio override. Default: window.devicePixelRatio */
  devicePixelRatio?: number
  /** Safety cap on dot count. Default: 100000 */
  maxDots?: number
  /** Pause animation when prefers-reduced-motion is set. Default: true */
  respectReducedMotion?: boolean
}

export interface ResolvedWavedanceConfig {
  dotSize: number
  gap: GapConfig
  foreground: string
  foregroundOpacity: number
  background: string
  backgroundOpacity: number
  animation: AnimationType
  wave: Required<WaveAnimationOptions>
  random: Required<RandomAnimationOptions>
  devicePixelRatio: number
  maxDots: number
  respectReducedMotion: boolean
}

export interface WavedanceInstance {
  /** Update configuration at runtime */
  update: (config: Partial<WavedanceConfig>) => void
  /** Stop animation and remove canvas */
  destroy: () => void
  /** Current resolved configuration */
  getConfig: () => ResolvedWavedanceConfig
}

export interface GridLayout {
  count: number
  cols: number
  rows: number
  x: Float32Array
  y: Float32Array
  width: number
  height: number
  dpr: number
}

export interface DrawOptions {
  dotSize: number
  foreground: string
  foregroundOpacity: number
  background: string
  backgroundOpacity: number
  dpr: number
}
