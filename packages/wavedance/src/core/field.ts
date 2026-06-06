import { computeNoneField } from "../animations/none"
import { RandomAnimation } from "../animations/random"
import { WaveAnimation } from "../animations/wave"
import type { AnimationType, GridLayout, ResolvedWavedanceConfig } from "../types"

export class FieldComputer {
  private readonly intensities: Float32Array
  private wave: WaveAnimation
  private random: RandomAnimation
  private animation: AnimationType

  constructor(maxDots: number, config: ResolvedWavedanceConfig) {
    this.intensities = new Float32Array(maxDots)
    this.animation = config.animation
    this.wave = new WaveAnimation(config.wave)
    this.random = new RandomAnimation(maxDots, config.random)
  }

  get buffer(): Float32Array {
    return this.intensities
  }

  updateConfig(config: ResolvedWavedanceConfig): void {
    if (config.animation !== this.animation) {
      this.animation = config.animation
      if (config.animation === "random") {
        this.random.reset()
      }
    }
    this.wave.updateOptions(config.wave)
    this.random.updateOptions(config.random)
  }

  compute(grid: GridLayout, time: number, deltaMs: number): Float32Array {
    const count = grid.count

    switch (this.animation) {
      case "none":
        computeNoneField(this.intensities, count)
        break
      case "wave":
        this.wave.compute(grid, this.intensities, time)
        break
      case "random":
        this.random.compute(grid, this.intensities, deltaMs)
        break
    }

    return this.intensities
  }
}
