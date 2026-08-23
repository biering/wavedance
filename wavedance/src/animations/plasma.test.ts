import { describe, expect, it } from "vitest"
import { buildGrid } from "../core/grid"
import { PlasmaAnimation } from "./plasma"

describe("PlasmaAnimation", () => {
  const grid = buildGrid({
    width: 300,
    height: 200,
    dotSize: 2,
    gap: { x: 12, y: 12 },
    dpr: 1,
    maxDots: 10_000,
  })
  const options = {
    scale: 0.004,
    speed: 0.0003,
    threshold: 0.15,
    softness: 0.5,
    seed: 42,
  }

  it("produces values in [0, 1] and changes over time", () => {
    const plasma = new PlasmaAnimation({ ...options, speed: 1 })
    const intensities = new Float32Array(grid.count)

    plasma.compute(grid, intensities, 0)
    const early = Float32Array.from(intensities)
    plasma.compute(grid, intensities, 5_000)

    let changed = 0
    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
      if (early[i] !== intensities[i]) changed++
    }
    expect(changed).toBeGreaterThan(0)
  })

  it("writes dual-field tints when a tint buffer is provided", () => {
    const plasma = new PlasmaAnimation(options)
    const intensities = new Float32Array(grid.count)
    const tints = new Float32Array(grid.count)

    plasma.compute(grid, intensities, 0, tints)

    let min = 1
    let max = 0
    let lit = 0
    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
      expect(tints[i]).toBeGreaterThanOrEqual(0)
      expect(tints[i]).toBeLessThanOrEqual(1)
      if (intensities[i] > 0.05) {
        lit++
        if (tints[i] < min) min = tints[i]
        if (tints[i] > max) max = tints[i]
      }
    }
    expect(lit).toBeGreaterThan(0)
    expect(max - min).toBeGreaterThan(0.2)
  })
})
