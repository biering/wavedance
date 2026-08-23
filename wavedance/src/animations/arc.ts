import type { ArcAnimationOptions, GridLayout } from "../types"

/**
 * Data-pixel arc: a U-shaped horizon band across the grid, with a slow
 * organic breathe. Distance to a power-curve is the gate; two sines warp
 * the band so it doesn't read as a static parabola.
 *
 * When `tints` is provided, a second overlapping band is sampled with a
 * phase/center offset so `secondaryForegroundColor` can paint a two-tone field.
 */
export class ArcAnimation {
  private options: Required<ArcAnimationOptions>

  constructor(options: Required<ArcAnimationOptions>) {
    this.options = { ...options }
  }

  updateOptions(options: Required<ArcAnimationOptions>): void {
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number, tints?: Float32Array): void {
    const { speed, center, drop, thickness, curve, falloff, breathe } = this.options
    const t = time * 0.001 * speed
    const height = grid.height
    const invWidth = 1 / (grid.width * grid.dpr)
    const invDpr = 1 / grid.dpr
    const invThick = 1 / Math.max(1, height * thickness)
    const arcY = height * center
    const dropPx = height * drop
    const dual = Boolean(tints)
    const arcY2 = height * Math.min(0.95, center + 0.16)
    const dropPx2 = height * drop * 0.92
    const curve2 = curve * 0.88
    const t2 = t + 2.2

    for (let i = 0; i < grid.count; i++) {
      const nx = grid.x[i] * invWidth * 2 - 1
      const y = grid.y[i] * invDpr
      const absNx = nx < 0 ? -nx : nx
      const edge = Math.max(0, 1 - absNx ** falloff)

      const w1 = bandWeight(y, nx, absNx, arcY, dropPx, curve, invThick, breathe, t, edge)
      const w2 = dual
        ? bandWeight(y, nx, absNx, arcY2, dropPx2, curve2, invThick, breathe, t2, edge)
        : 0

      const alpha = w1 > w2 ? w1 : w2
      intensities[i] = alpha <= 0.02 ? 0 : alpha > 1 ? 1 : alpha

      if (tints) {
        tints[i] = w2 / (w1 + w2 + 1e-6)
      }
    }
  }
}

function bandWeight(
  y: number,
  nx: number,
  absNx: number,
  arcY: number,
  dropPx: number,
  curve: number,
  invThick: number,
  breathe: number,
  t: number,
  edge: number,
): number {
  const bandY = arcY + absNx ** curve * dropPx
  let weight = 1 - Math.abs(y - bandY) * invThick
  if (weight <= 0.01) return 0
  weight += Math.sin(nx * 4 - t * 1.5) * breathe + Math.cos(y * 0.01 + t) * breathe
  if (weight < 0) weight = 0
  else if (weight > 1) weight = 1
  weight *= edge
  return weight <= 0.02 ? 0 : weight
}
