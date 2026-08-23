import { smoothstep } from "../core/noise"
import type { GridLayout, WaveAnimationOptions } from "../types"

export class WaveAnimation {
  private options: Required<WaveAnimationOptions>

  constructor(options: Required<WaveAnimationOptions>) {
    this.options = { ...options }
  }

  updateOptions(options: Required<WaveAnimationOptions>): void {
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number, tints?: Float32Array): void {
    const { scale, speed, threshold, softness } = this.options
    const t = time * speed
    const gated = threshold > 0
    const edge1 = threshold + softness
    const tintT = t * 0.48
    const invW = 1 / Math.max(1, grid.width * grid.dpr)
    const invH = 1 / Math.max(1, grid.height * grid.dpr)

    for (let i = 0; i < grid.count; i++) {
      const x = grid.x[i] * scale
      const y = grid.y[i] * scale

      let v = Math.sin(x + t)
      v += Math.sin(y + t * 1.3)
      v += Math.sin((x + y) * 0.5 + t * 0.7)

      const cx = x + 0.5 * Math.sin(t * 0.4)
      const cy = y + 0.5 * Math.cos(t * 0.6)
      v += Math.sin(Math.sqrt(cx * cx + cy * cy) + t)

      const intensity = v * 0.125 + 0.5
      intensities[i] = gated ? smoothstep(threshold, edge1, intensity) : intensity

      if (tints) {
        // Canvas-normalized territories stay large and mostly 0/1 so both
        // hues read as distinct regions instead of a muddy mid-mix.
        const u = grid.x[i] * invW
        const vTint = grid.y[i] * invH
        const tv = Math.sin(u * 8.2 + tintT) + Math.sin(vTint * 7.1 - tintT * 0.8)
        tints[i] = smoothstep(-0.3, 0.3, tv)
      }
    }
  }
}
