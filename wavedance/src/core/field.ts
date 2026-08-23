import { ArcAnimation } from "../animations/arc"
import { PlasmaAnimation } from "../animations/plasma"
import { RandomAnimation } from "../animations/random"
import { RibbonAnimation } from "../animations/ribbon"
import { WaveAnimation } from "../animations/wave"
import type { AnimationType, GridLayout, ResolvedWavedanceConfig } from "../types"

export class FieldComputer {
  private readonly intensities: Float32Array
  private readonly tints: Float32Array
  private wave: WaveAnimation
  private random: RandomAnimation
  private plasma: PlasmaAnimation
  private arc: ArcAnimation
  private ribbon: RibbonAnimation
  private animation: AnimationType
  private useTints: boolean

  constructor(maxDots: number, config: ResolvedWavedanceConfig) {
    this.intensities = new Float32Array(maxDots)
    this.tints = new Float32Array(maxDots)
    this.animation = config.animation
    this.useTints = Boolean(config.secondaryForegroundColor)
    this.wave = new WaveAnimation(config.wave)
    this.random = new RandomAnimation(maxDots, config.random)
    this.plasma = new PlasmaAnimation(config.plasma)
    this.arc = new ArcAnimation(config.arc)
    this.ribbon = new RibbonAnimation(config.ribbon)
  }

  get buffer(): Float32Array {
    return this.intensities
  }

  get tintBuffer(): Float32Array {
    return this.tints
  }

  updateConfig(config: ResolvedWavedanceConfig): void {
    this.useTints = Boolean(config.secondaryForegroundColor)
    if (config.animation !== this.animation) {
      this.animation = config.animation
      if (config.animation === "random") {
        this.random.reset()
      }
    }
    this.wave.updateOptions(config.wave)
    this.random.updateOptions(config.random)
    this.plasma.updateOptions(config.plasma)
    this.arc.updateOptions(config.arc)
    this.ribbon.updateOptions(config.ribbon)
  }

  compute(grid: GridLayout, time: number, deltaMs: number): Float32Array {
    const tints = this.useTints ? this.tints : undefined
    switch (this.animation) {
      case "wave":
        this.wave.compute(grid, this.intensities, time, tints)
        break
      case "random":
        this.random.compute(grid, this.intensities, deltaMs)
        break
      case "plasma":
        this.plasma.compute(grid, this.intensities, time, tints)
        break
      case "arc":
        this.arc.compute(grid, this.intensities, time, this.tints)
        break
      case "ribbon":
        this.ribbon.compute(grid, this.intensities, time, this.tints)
        break
    }

    return this.intensities
  }
}
