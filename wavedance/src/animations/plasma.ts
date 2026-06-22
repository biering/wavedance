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

  compute(grid: GridLayout, intensities: Float32Array, time: number): void {
    const { scale, speed, threshold, softness } = this.options
    const t = time * speed
    const edge1 = threshold + softness

    for (let i = 0; i < grid.count; i++) {
      const nx = grid.x[i] * scale
      const ny = grid.y[i] * scale
      const noiseValue = this.noise.noise3Normalized(nx, ny, t)
      intensities[i] = smoothstep(threshold, edge1, noiseValue)
    }
  }
}
