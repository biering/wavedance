import { describe, expect, it } from "vitest"
import { buildGrid } from "../core/grid"
import { RibbonAnimation } from "./ribbon"

describe("RibbonAnimation", () => {
  const grid = buildGrid({
    width: 300,
    height: 200,
    dotSize: 2,
    gap: { x: 12, y: 12 },
    dpr: 1,
    maxDots: 10_000,
  })

  const options = {
    speed: 1,
    amplitude: 0.2,
    thickness: 1,
    spread: 1,
    fade: 0,
    bloom: 0.5,
  }

  it("keeps intensities within [0, 1]", () => {
    const ribbon = new RibbonAnimation(options)
    const intensities = new Float32Array(grid.count)

    ribbon.compute(grid, intensities, 2_000)

    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
    }
  })

  it("is deterministic", () => {
    const a = new Float32Array(grid.count)
    const b = new Float32Array(grid.count)

    new RibbonAnimation(options).compute(grid, a, 3_000)
    new RibbonAnimation(options).compute(grid, b, 3_000)

    expect(Array.from(a)).toEqual(Array.from(b))
  })

  it("lights bands rather than the whole grid", () => {
    const ribbon = new RibbonAnimation({ ...options, bloom: 0 })
    const intensities = new Float32Array(grid.count)

    ribbon.compute(grid, intensities, 0)

    let lit = 0
    let dark = 0
    for (let i = 0; i < grid.count; i++) {
      if (intensities[i] > 0.05) lit++
      else dark++
    }
    expect(lit).toBeGreaterThan(0)
    expect(dark).toBeGreaterThan(0)
  })

  it("advances over time", () => {
    const ribbon = new RibbonAnimation(options)
    const a = new Float32Array(grid.count)
    const b = new Float32Array(grid.count)

    ribbon.compute(grid, a, 0)
    ribbon.compute(grid, b, 8_000)

    let changed = 0
    for (let i = 0; i < grid.count; i++) {
      if (a[i] !== b[i]) changed++
    }
    expect(changed).toBeGreaterThan(0)
  })

  it("writes per-dot tints in [0, 1] with variation across bands", () => {
    const ribbon = new RibbonAnimation({ ...options, bloom: 0 })
    const intensities = new Float32Array(grid.count)
    const tints = new Float32Array(grid.count)

    ribbon.compute(grid, intensities, 0, tints)

    let min = 1
    let max = 0
    let lit = 0
    for (let i = 0; i < grid.count; i++) {
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
