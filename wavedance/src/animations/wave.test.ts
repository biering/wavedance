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
})
