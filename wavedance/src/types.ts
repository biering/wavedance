export type AnimationType = "random" | "wave" | "plasma" | "arc" | "ribbon"

export interface GapConfig {
  x: number
  y: number
}

export interface WaveAnimationOptions {
  /** Spatial frequency of the sine layers. Default: 0.01 */
  scale?: number
  /** Animation speed multiplier. Default: 0.001 */
  speed?: number
  /**
   * Lower edge of the smoothstep gate applied to each dot. Dots below this
   * fade to fully empty; dots at `threshold + softness` reach full opacity.
   * `0` disables the gate (smooth, gapless — the original behavior). Default: 0
   */
  threshold?: number
  /** Width of the fade transition above `threshold`. Default: 0.5 */
  softness?: number
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

export interface PlasmaAnimationOptions {
  /** Noise sampling scale. Lower = larger clusters. Default: 0.004 */
  scale?: number
  /** Animation speed multiplier. Default: 0.0003 */
  speed?: number
  /** Lower edge of smoothstep threshold. Default: 0.15 */
  threshold?: number
  /** Width of the fade transition. Default: 0.5 */
  softness?: number
  /** Noise seed for deterministic output. Default: 42 */
  seed?: number
}

export interface ArcAnimationOptions {
  /** Breathing speed. `1` matches the original ~1 cycle per second. Default: 1 */
  speed?: number
  /** Vertical position of the band, as a fraction of height. Default: 0.4 */
  center?: number
  /** How far the band drops toward the edges, as a fraction of height. Default: 0.9 */
  drop?: number
  /** Band thickness as a fraction of height. Default: 0.35 */
  thickness?: number
  /** Arc curvature exponent. Higher = flatter middle, sharper drop. Default: 1.8 */
  curve?: number
  /** Horizontal edge-fade exponent. Default: 2.5 */
  falloff?: number
  /** Organic breathing amplitude. Default: 0.1 */
  breathe?: number
}

export interface RibbonAnimationOptions {
  /** Phase speed. `1` matches the original ~0.22 cycles per second. Default: 1 */
  speed?: number
  /** Vertical amplitude of the sine paths. Default: 0.2 */
  amplitude?: number
  /** Ribbon thickness multiplier. Default: 1 */
  thickness?: number
  /** Vertical spacing of the three bands. Default: 1 */
  spread?: number
  /** Left-to-right composition fade. `0` is even, `1` matches the original. Default: 0.25 */
  fade?: number
  /** Soft bloom orbs. Default: 0.5 */
  bloom?: number
}

export interface WavedanceConfig {
  /** Dot diameter in CSS pixels. Default: 2 */
  dotSize?: number
  /**
   * How much each dot's size tracks its intensity (0–1), mirroring opacity:
   * more visible (brighter) dots grow larger, fainter dots shrink toward
   * nothing. `0` draws every dot at `dotSize` (uniform, the original
   * behavior); at `1` a fully-lit dot grows to ~4× `dotSize`. Default: 0
   */
  dotSizeVariation?: number
  /** Gap between dots in CSS pixels (symmetric or per-axis). Default: 12 */
  gap?: number | GapConfig
  /** Dot color as hex string. Default: "#7c7c7c" */
  foreground?: string
  /**
   * Optional second tint. Wave paints slow color territories across the
   * ripples; plasma mixes a second offset blob field; ribbon assigns it to
   * bands; arc draws a second overlapping band. Empty is a single color.
   * Default: `""`
   */
  secondaryForegroundColor?: string
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
  /** Plasma animation options */
  plasma?: PlasmaAnimationOptions
  /** Arc / data-pixel horizon options */
  arc?: ArcAnimationOptions
  /** Ribbon-field options */
  ribbon?: RibbonAnimationOptions
  /** Device pixel ratio override. Default: auto-detected, capped by `maxDevicePixelRatio`. */
  devicePixelRatio?: number
  /**
   * Upper bound applied to the auto-detected device pixel ratio, to cap paint
   * cost on high-DPR screens. Ignored when `devicePixelRatio` is set. Default: 2
   */
  maxDevicePixelRatio?: number
  /** Safety cap on dot count. Default: 100000 */
  maxDots?: number
  /** Pause animation when prefers-reduced-motion is set. Default: true */
  respectReducedMotion?: boolean
}

export interface ResolvedWavedanceConfig {
  dotSize: number
  dotSizeVariation: number
  gap: GapConfig
  foreground: string
  secondaryForegroundColor: string
  foregroundOpacity: number
  background: string
  backgroundOpacity: number
  animation: AnimationType
  wave: Required<WaveAnimationOptions>
  random: Required<RandomAnimationOptions>
  plasma: Required<PlasmaAnimationOptions>
  arc: Required<ArcAnimationOptions>
  ribbon: Required<RibbonAnimationOptions>
  devicePixelRatio: number
  maxDevicePixelRatio: number
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
  dotSizeVariation: number
  foreground: string
  foregroundOpacity: number
  background: string
  backgroundOpacity: number
  dpr: number
  /** Second fill mixed with `foreground` using `tints`. Empty disables mixing. */
  foreground2?: string
  /** Per-dot mix toward `foreground2` in [0, 1]. */
  tints?: Float32Array
}
