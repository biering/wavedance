import { describe, expect, it } from "vitest"
import { buildGrid } from "./grid"

describe("buildGrid", () => {
  it("creates a grid with expected dot count", () => {
    const grid = buildGrid({
      width: 200,
      height: 100,
      dotSize: 2,
      gap: { x: 10, y: 10 },
      dpr: 1,
      maxDots: 100_000,
    })

    expect(grid.count).toBeGreaterThan(0)
    expect(grid.x.length).toBe(grid.count)
    expect(grid.y.length).toBe(grid.count)
    expect(grid.cols).toBeGreaterThan(0)
    expect(grid.rows).toBeGreaterThan(0)
  })

  it("respects maxDots cap", () => {
    const grid = buildGrid({
      width: 2000,
      height: 2000,
      dotSize: 1,
      gap: { x: 2, y: 2 },
      dpr: 2,
      maxDots: 500,
    })

    expect(grid.count).toBeLessThanOrEqual(500)
  })

  it("centers dots within canvas bounds", () => {
    const grid = buildGrid({
      width: 100,
      height: 100,
      dotSize: 2,
      gap: { x: 8, y: 8 },
      dpr: 1,
      maxDots: 10_000,
    })

    for (let i = 0; i < grid.count; i++) {
      expect(grid.x[i]).toBeGreaterThanOrEqual(0)
      expect(grid.y[i]).toBeGreaterThanOrEqual(0)
      expect(grid.x[i]).toBeLessThanOrEqual(100)
      expect(grid.y[i]).toBeLessThanOrEqual(100)
    }
  })
})
