import { describe, expect, it } from "vitest"
import { resolveConfig } from "./config"
import { FieldComputer } from "./field"
import { buildGrid } from "./grid"

describe("FieldComputer", () => {
  const grid = buildGrid({
    width: 300,
    height: 200,
    dotSize: 2,
    gap: { x: 12, y: 12 },
    dpr: 1,
    maxDots: 10_000,
  })

  it("wave animation produces values in [0, 1] without NaN", () => {
    const config = resolveConfig({ animation: "wave", wave: { seed: 7 } })
    const field = new FieldComputer(config.maxDots, config)
    const intensities = field.compute(grid, 1000, 16)

    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
      expect(Number.isNaN(intensities[i])).toBe(false)
    }
  })

  it("wave animation changes over time", () => {
    const config = resolveConfig({
      animation: "wave",
      wave: { seed: 7, speed: 1, threshold: 0.2, softness: 0.6 },
    })
    const field = new FieldComputer(config.maxDots, config)
    const early = Float32Array.from(field.compute(grid, 0, 16))
    const late = Float32Array.from(field.compute(grid, 5_000, 16))

    let changed = 0
    for (let i = 0; i < grid.count; i++) {
      if (early[i] !== late[i]) {
        changed++
      }
    }
    expect(changed).toBeGreaterThan(0)
  })

  it("random animation stays in bounds and is deterministic", () => {
    const config = resolveConfig({ animation: "random", random: { seed: 11 } })
    const fieldA = new FieldComputer(config.maxDots, config)
    const fieldB = new FieldComputer(config.maxDots, config)

    let a = fieldA.compute(grid, 0, 16)
    for (let frame = 0; frame < 30; frame++) {
      a = fieldA.compute(grid, frame * 16, 16)
      for (let i = 0; i < grid.count; i++) {
        expect(a[i]).toBeGreaterThanOrEqual(config.random.minOpacity)
        expect(a[i]).toBeLessThanOrEqual(config.random.maxOpacity)
      }
    }

    let b = fieldB.compute(grid, 0, 16)
    for (let frame = 0; frame < 30; frame++) {
      b = fieldB.compute(grid, frame * 16, 16)
    }

    for (let i = 0; i < grid.count; i++) {
      expect(a[i]).toBe(b[i])
    }
  })

  it("none animation sets all dots to full opacity", () => {
    const config = resolveConfig({ animation: "none" })
    const field = new FieldComputer(config.maxDots, config)
    const intensities = field.compute(grid, 0, 16)

    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBe(1)
    }
  })

  it("hot path does not allocate new intensity buffers", () => {
    const config = resolveConfig({ animation: "wave" })
    const field = new FieldComputer(config.maxDots, config)
    const first = field.compute(grid, 0, 16)
    const second = field.compute(grid, 16, 16)
    expect(second).toBe(first)
  })
})
