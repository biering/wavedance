import { FlowAnimation } from "../animations/flow"
import { PlasmaAnimation } from "../animations/plasma"
import { RandomAnimation } from "../animations/random"
import { WaveAnimation } from "../animations/wave"
import type { AnimationType, GridLayout, ResolvedWavedanceConfig } from "../types"

export class FieldComputer {
  private readonly intensities: Float32Array
  private wave: WaveAnimation
  private random: RandomAnimation
  private plasma: PlasmaAnimation
  private flow: FlowAnimation
  private animation: AnimationType

  constructor(maxDots: number, config: ResolvedWavedanceConfig) {
    this.intensities = new Float32Array(maxDots)
    this.animation = config.animation
    this.wave = new WaveAnimation(config.wave)
    this.random = new RandomAnimation(maxDots, config.random)
    this.plasma = new PlasmaAnimation(config.plasma)
    this.flow = new FlowAnimation(config.flow)
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
    this.plasma.updateOptions(config.plasma)
    this.flow.updateOptions(config.flow)
  }

  compute(grid: GridLayout, time: number, deltaMs: number): Float32Array {
    switch (this.animation) {
      case "wave":
        this.wave.compute(grid, this.intensities, time)
        break
      case "random":
        this.random.compute(grid, this.intensities, deltaMs)
        break
      case "plasma":
        this.plasma.compute(grid, this.intensities, time)
        break
      case "flow":
        this.flow.compute(grid, this.intensities, time)
        break
    }

    return this.intensities
  }
}
