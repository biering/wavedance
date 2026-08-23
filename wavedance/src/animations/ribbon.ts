import { smoothstep } from "../core/noise"
import type { GridLayout, RibbonAnimationOptions } from "../types"

/**
 * Ribbon field, ported from ThreeUI's fragment shader:
 * three sine-warped gaussian bands plus two soft bloom orbs.
 * https://threeui.com/backgrounds/predictive-arc/ribbon-field
 */
export class RibbonAnimation {
  private options: Required<RibbonAnimationOptions>

  constructor(options: Required<RibbonAnimationOptions>) {
    this.options = { ...options }
  }

  updateOptions(options: Required<RibbonAnimationOptions>): void {
    this.options = { ...options }
  }

  compute(grid: GridLayout, intensities: Float32Array, time: number, tints?: Float32Array): void {
    const { speed, amplitude, thickness, spread, fade, bloom } = this.options
    const t = time * 0.00022 * speed
    const invW = 1 / (grid.width * grid.dpr)
    const invH = 1 / (grid.height * grid.dpr)
    const w1 = Math.max(1e-5, 0.0065 * thickness)
    const w2 = Math.max(1e-5, 0.0085 * thickness)
    const w3 = Math.max(1e-5, 0.014 * thickness)
    const o1 = 0.03 * spread
    const o2 = -0.23 * spread
    const o3 = 0.25 * spread
    const p1 = t + 0.9
    const p2 = t + 3.25
    const p3 = t + 1.85
    const bloomY1 = 0.4 + 0.035 * Math.sin(t)
    const bloomY2 = 0.75 + 0.025 * Math.cos(t)
    const waviness = 0.045

    for (let i = 0; i < grid.count; i++) {
      const u = grid.x[i] * invW
      const v = 1 - grid.y[i] * invH

      const y1 = 0.55 + amplitude * Math.sin(u * 2.15 + p1) + waviness * Math.sin(u * 7 - p1 * 0.7)
      const y2 = 0.55 + amplitude * Math.sin(u * 2.15 + p2) + waviness * Math.sin(u * 7 - p2 * 0.7)
      const y3 = 0.55 + amplitude * Math.sin(u * 2.15 + p3) + waviness * Math.sin(u * 7 - p3 * 0.7)

      const d1 = v - y1 - o1
      const d2 = v - y2 - o2
      const d3 = v - y3 - o3
      const r1 = Math.exp((-d1 * d1) / w1)
      const r2 = Math.exp((-d2 * d2) / w2)
      const r3 = Math.exp((-d3 * d3) / w3)

      const bx1 = u - 0.76
      const by1 = v - bloomY1
      const bx2 = u - 0.71
      const by2 = v - bloomY2
      const bloomAmt =
        (Math.exp((-bx1 * bx1 - by1 * by1) / 0.05) + Math.exp((-bx2 * bx2 - by2 * by2) / 0.03)) *
        bloom

      let alpha = (r1 * 1.14 + r2 * 1.05 + r3 * 0.48) * 1.55 + bloomAmt

      if (fade > 0) {
        const dx = u - 0.18
        const dy = v - 0.48
        const mask =
          smoothstep(0.28, 0.72, u) * (1 - (1 - smoothstep(0, 0.88, Math.hypot(dx, dy))) * 0.56)
        alpha *= 1 - fade + fade * mask
      }

      if (alpha < 0.02) intensities[i] = 0
      else if (alpha > 1) intensities[i] = 1
      else intensities[i] = alpha

      if (tints) {
        // Original shader: r1 is cyan/teal, r2/r3 are blue/indigo/purple, bloom is cyan.
        const weightA = r1 * 1.54 + bloomAmt
        const weightB = r2 * 0.96 + r3 * 0.72
        tints[i] = weightB / (weightA + weightB + 1e-6)
      }
    }
  }
}
