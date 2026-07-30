import { describe, expect, it } from "vitest"
import { buildGrid } from "../core/grid"
import { FlowAnimation } from "./flow"

describe("FlowAnimation", () => {
  const grid = buildGrid({
    width: 300,
    height: 200,
    dotSize: 2,
    gap: { x: 12, y: 12 },
    dpr: 1,
    maxDots: 10_000,
  })

  const options = { scale: 0.006, speed: 0.0004, seed: 42 }

  it("keeps intensities within [0, 1]", () => {
    const flow = new FlowAnimation(options)
    const intensities = new Float32Array(grid.count)

    flow.compute(grid, intensities, 2_000)

    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
    }
  })

  it("is deterministic for a given seed", () => {
    const a = new Float32Array(grid.count)
    const b = new Float32Array(grid.count)

    new FlowAnimation(options).compute(grid, a, 3_000)
    new FlowAnimation(options).compute(grid, b, 3_000)

    expect(Array.from(a)).toEqual(Array.from(b))
  })

  it("advances over time", () => {
    const flow = new FlowAnimation(options)
    const a = new Float32Array(grid.count)
    const b = new Float32Array(grid.count)

    flow.compute(grid, a, 0)
    flow.compute(grid, b, 6_000)

    let changed = 0
    for (let i = 0; i < grid.count; i++) {
      if (a[i] !== b[i]) changed++
    }
    expect(changed).toBeGreaterThan(0)
  })
})
