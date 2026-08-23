import { SimplexNoise, smoothstep } from "../core/noise"
import type { GridLayout, PlasmaAnimationOptions } from "../types"

export class PlasmaAnimation {
  private noise: SimplexNoise
  private options: Required<PlasmaAnimationOptions>

  constructor(options: Required<PlasmaAnimationOptions>) {
    this.options = { ...options }
    this.noise = new SimplexNoise(options.seed)
  }

  updateOptions(options: Required<PlasmaAnimationOptions>): void {
    if (options.seed !== this.options.seed) {
      this.noise = new SimplexNoise(options.seed)
    }
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number, tints?: Float32Array): void {
    const { scale, speed, threshold, softness } = this.options
    const t = time * speed
    const edge1 = threshold + softness
    const t2 = t * 0.84 + 2.1

    for (let i = 0; i < grid.count; i++) {
      const nx = grid.x[i] * scale
      const ny = grid.y[i] * scale
      const a = smoothstep(threshold, edge1, this.noise.noise3Normalized(nx, ny, t))

      if (!tints) {
        intensities[i] = a
        continue
      }

      // A domain-offset second sample reads as a peer blob population, so both
      // colors occupy bright clusters instead of splitting core vs edge.
      const b = smoothstep(threshold, edge1, this.noise.noise3Normalized(nx + 5.3, ny - 3.8, t2))
      intensities[i] = a > b ? a : b
      tints[i] = smoothstep(0.25, 0.75, b / (a + b + 1e-6))
    }
  }
}
