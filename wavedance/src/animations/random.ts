import { SeededRng } from "../core/rng"
import type { GridLayout, RandomAnimationOptions } from "../types"

export class RandomAnimation {
  private readonly options: Required<RandomAnimationOptions>
  private readonly targets: Float32Array
  private readonly rng: SeededRng
  private initialized = false

  constructor(maxDots: number, options: Required<RandomAnimationOptions>) {
    this.options = options
    this.targets = new Float32Array(maxDots)
    this.rng = new SeededRng(options.seed)
  }

  updateOptions(options: Required<RandomAnimationOptions>): void {
    Object.assign(this.options, options)
  }

  private pickTarget(): number {
    const { minOpacity, maxOpacity } = this.options
    return this.rng.range(minOpacity, maxOpacity)
  }

  compute(grid: GridLayout, intensities: Float32Array, deltaMs: number): void {
    const { speed } = this.options
    const step = speed * (deltaMs / 1000)
    const count = grid.count

    if (!this.initialized) {
      for (let i = 0; i < count; i++) {
        intensities[i] = this.pickTarget()
        this.targets[i] = this.pickTarget()
      }
      this.initialized = true
      return
    }

    for (let i = 0; i < count; i++) {
      const current = intensities[i]
      const target = this.targets[i]
      const diff = target - current

      if (Math.abs(diff) <= step) {
        intensities[i] = target
        this.targets[i] = this.pickTarget()
      } else {
        intensities[i] = current + Math.sign(diff) * step
      }
    }
  }

  reset(): void {
    this.initialized = false
  }
}
