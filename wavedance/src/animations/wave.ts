import type { GridLayout, WaveAnimationOptions } from "../types"

export class WaveAnimation {
  private options: Required<WaveAnimationOptions>

  constructor(options: Required<WaveAnimationOptions>) {
    this.options = { ...options }
  }

  updateOptions(options: Required<WaveAnimationOptions>): void {
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number): void {
    const { scale, speed } = this.options
    const t = time * speed

    for (let i = 0; i < grid.count; i++) {
      const x = grid.x[i] * scale
      const y = grid.y[i] * scale

      let v = Math.sin(x + t)
      v += Math.sin(y + t * 1.3)
      v += Math.sin((x + y) * 0.5 + t * 0.7)

      const cx = x + 0.5 * Math.sin(t * 0.4)
      const cy = y + 0.5 * Math.cos(t * 0.6)
      v += Math.sin(Math.sqrt(cx * cx + cy * cy) + t)

      intensities[i] = v * 0.125 + 0.5
    }
  }
}
