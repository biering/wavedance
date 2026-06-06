import { describe, expect, it } from "vitest"
import { SimplexNoise, smoothstep } from "./noise"

describe("SimplexNoise", () => {
  it("is deterministic for the same seed", () => {
    const a = new SimplexNoise(42)
    const b = new SimplexNoise(42)
    for (let i = 0; i < 20; i++) {
      expect(a.noise3(i, i * 2, i * 3)).toBe(b.noise3(i, i * 2, i * 3))
    }
  })

  it("differs for different seeds", () => {
    const a = new SimplexNoise(1)
    const b = new SimplexNoise(2)
    const samplesA = Array.from({ length: 10 }, (_, i) => a.noise3(i * 0.7, i * 1.1, i * 0.3))
    const samplesB = Array.from({ length: 10 }, (_, i) => b.noise3(i * 0.7, i * 1.1, i * 0.3))
    expect(samplesA).not.toEqual(samplesB)
  })

  it("changes with the z input", () => {
    const noise = new SimplexNoise(7)
    const atZ0 = noise.noise3Normalized(1.5, 2.5, 0)
    const atZ1 = noise.noise3Normalized(1.5, 2.5, 1)
    expect(atZ0).not.toBe(atZ1)
  })

  it("returns normalized values in [0, 1]", () => {
    const noise = new SimplexNoise(99)
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const value = noise.noise3Normalized(x * 0.5, y * 0.5, 0)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
        expect(Number.isNaN(value)).toBe(false)
      }
    }
  })
})

describe("smoothstep", () => {
  it("returns 0 below edge0 and 1 above edge1", () => {
    expect(smoothstep(0.3, 0.7, 0.1)).toBe(0)
    expect(smoothstep(0.3, 0.7, 0.9)).toBe(1)
  })

  it("returns 0.5 at midpoint", () => {
    expect(smoothstep(0, 1, 0.5)).toBe(0.5)
  })
})
