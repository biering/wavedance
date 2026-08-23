import { describe, expect, it } from "vitest"
import { buildGrid } from "../core/grid"
import { WaveAnimation } from "./wave"

describe("WaveAnimation", () => {
  const grid = buildGrid({
    width: 300,
    height: 200,
    dotSize: 2,
    gap: { x: 12, y: 12 },
    dpr: 1,
    maxDots: 10_000,
  })

  it("produces different intensities at different times", () => {
    const wave = new WaveAnimation({
      scale: 0.01,
      speed: 0.01,
      threshold: 0,
      softness: 0.5,
    })
    const intensities = new Float32Array(grid.count)

    wave.compute(grid, intensities, 0)
    const snapshotA = Float32Array.from(intensities)

    wave.compute(grid, intensities, 5_000)
    const snapshotB = Float32Array.from(intensities)

    let changed = 0
    for (let i = 0; i < grid.count; i++) {
      if (snapshotA[i] !== snapshotB[i]) {
        changed++
      }
    }
    expect(changed).toBeGreaterThan(0)
  })

  it("leaves intensities ungated when threshold is 0", () => {
    const wave = new WaveAnimation({ scale: 0.01, speed: 0.01, threshold: 0, softness: 0.5 })
    const intensities = new Float32Array(grid.count)

    wave.compute(grid, intensities, 1_000)

    let exactlyZero = 0
    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
      if (intensities[i] === 0) exactlyZero++
    }
    // The smooth field only grazes 0, so empty dots should be rare or absent.
    expect(exactlyZero).toBeLessThan(grid.count / 2)
  })

  it("opens empty spaces and reaches full opacity when gated by threshold", () => {
    const wave = new WaveAnimation({ scale: 0.01, speed: 0.01, threshold: 0.5, softness: 0.15 })
    const intensities = new Float32Array(grid.count)

    wave.compute(grid, intensities, 1_000)

    let empty = 0
    let full = 0
    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBeGreaterThanOrEqual(0)
      expect(intensities[i]).toBeLessThanOrEqual(1)
      if (intensities[i] === 0) empty++
      if (intensities[i] === 1) full++
    }
    // Gating pushes below-threshold dots to fully empty and above-edge dots to full.
    expect(empty).toBeGreaterThan(0)
    expect(full).toBeGreaterThan(0)
  })

  it("writes slow color territories without changing intensity", () => {
    const wave = new WaveAnimation({ scale: 0.01, speed: 0.01, threshold: 0.25, softness: 0.4 })
    const intensities = new Float32Array(grid.count)
    const tints = new Float32Array(grid.count)

    wave.compute(grid, intensities, 1_000)
    const snapshot = Float32Array.from(intensities)

    wave.compute(grid, intensities, 1_000, tints)

    let min = 1
    let max = 0
    let lit = 0
    for (let i = 0; i < grid.count; i++) {
      expect(intensities[i]).toBe(snapshot[i])
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
