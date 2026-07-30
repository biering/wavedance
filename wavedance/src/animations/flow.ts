import { SimplexNoise } from "../core/noise"
import type { FlowAnimationOptions, GridLayout } from "../types"

const TWO_PI = Math.PI * 2

/**
 * Curl-noise flow field. A low-frequency noise field assigns each dot a flow
 * direction; intensity is a travelling wavefront projected onto that direction,
 * producing locally-coherent streaks that drift like currents.
 */
export class FlowAnimation {
  private noise: SimplexNoise
  private options: Required<FlowAnimationOptions>

  constructor(options: Required<FlowAnimationOptions>) {
    this.options = { ...options }
    this.noise = new SimplexNoise(options.seed)
  }

  updateOptions(options: Required<FlowAnimationOptions>): void {
    if (options.seed !== this.options.seed) {
      this.noise = new SimplexNoise(options.seed)
    }
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number): void {
    const { scale, speed } = this.options
    const t = time * speed
    const dirFreq = scale
    const bandFreq = scale * 2.5

    for (let i = 0; i < grid.count; i++) {
      const x = grid.x[i]
      const y = grid.y[i]

      // Direction of the local current, drifting slowly over time.
      const angle = this.noise.noise3(x * dirFreq, y * dirFreq, t * 0.5) * TWO_PI
      // Project the dot onto the flow direction to get travelling bands.
      const proj = x * Math.cos(angle) + y * Math.sin(angle)

      intensities[i] = 0.5 + 0.5 * Math.sin(proj * bandFreq + t * 4)
    }
  }
}
