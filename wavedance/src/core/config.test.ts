import { describe, expect, it } from "vitest"
import { clampOpacity, resolveConfig } from "./config"

describe("resolveConfig opacity", () => {
  it("defaults foreground and background opacity to 1", () => {
    const config = resolveConfig({})
    expect(config.foregroundOpacity).toBe(1)
    expect(config.backgroundOpacity).toBe(1)
  })

  it("clamps opacity to 0–1", () => {
    expect(clampOpacity(-0.5)).toBe(0)
    expect(clampOpacity(0.35)).toBe(0.35)
    expect(clampOpacity(1.5)).toBe(1)
  })

  it("preserves configured opacity values", () => {
    const config = resolveConfig({
      foregroundOpacity: 0.6,
      backgroundOpacity: 0.25,
    })
    expect(config.foregroundOpacity).toBe(0.6)
    expect(config.backgroundOpacity).toBe(0.25)
  })
})

describe("resolveConfig dotSizeVariation", () => {
  it("defaults to 0.3", () => {
    expect(resolveConfig({}).dotSizeVariation).toBe(0.3)
  })

  it("clamps to 0–1", () => {
    expect(resolveConfig({ dotSizeVariation: -1 }).dotSizeVariation).toBe(0)
    expect(resolveConfig({ dotSizeVariation: 0.4 }).dotSizeVariation).toBe(0.4)
    expect(resolveConfig({ dotSizeVariation: 2 }).dotSizeVariation).toBe(1)
  })
})

describe("resolveConfig wave gate", () => {
  it("defaults to a gentle gate (threshold 0.25, softness 0.4)", () => {
    const wave = resolveConfig({}).wave
    expect(wave.threshold).toBe(0.25)
    expect(wave.softness).toBe(0.4)
  })

  it("preserves configured wave threshold and softness", () => {
    const wave = resolveConfig({ wave: { threshold: 0.4, softness: 0.2 } }).wave
    expect(wave.threshold).toBe(0.4)
    expect(wave.softness).toBe(0.2)
  })
})

describe("resolveConfig flow", () => {
  it("provides flow defaults", () => {
    const flow = resolveConfig({}).flow
    expect(flow.scale).toBeGreaterThan(0)
    expect(flow.speed).toBeGreaterThan(0)
    expect(flow.seed).toBe(42)
  })
})

describe("resolveConfig devicePixelRatio", () => {
  it("defaults maxDevicePixelRatio to 2", () => {
    expect(resolveConfig({}).maxDevicePixelRatio).toBe(2)
  })

  it("caps the auto-detected dpr at maxDevicePixelRatio", () => {
    const original = window.devicePixelRatio
    Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true })
    try {
      expect(resolveConfig({}).devicePixelRatio).toBe(2)
      expect(resolveConfig({ maxDevicePixelRatio: 1 }).devicePixelRatio).toBe(1)
    } finally {
      Object.defineProperty(window, "devicePixelRatio", { value: original, configurable: true })
    }
  })

  it("lets an explicit devicePixelRatio bypass the cap", () => {
    expect(resolveConfig({ devicePixelRatio: 3, maxDevicePixelRatio: 2 }).devicePixelRatio).toBe(3)
  })
})
