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

describe("resolveConfig arc", () => {
  it("provides arc defaults", () => {
    const arc = resolveConfig({}).arc
    expect(arc.speed).toBe(1)
    expect(arc.center).toBe(0.4)
    expect(arc.drop).toBe(0.9)
    expect(arc.thickness).toBe(0.35)
    expect(arc.curve).toBe(1.8)
    expect(arc.falloff).toBe(2.5)
    expect(arc.breathe).toBe(0.1)
  })
})

describe("resolveConfig ribbon", () => {
  it("provides ribbon defaults", () => {
    const ribbon = resolveConfig({}).ribbon
    expect(ribbon.speed).toBe(1)
    expect(ribbon.amplitude).toBe(0.2)
    expect(ribbon.thickness).toBe(1)
    expect(ribbon.spread).toBe(1)
    expect(ribbon.fade).toBe(0.25)
    expect(ribbon.bloom).toBe(0.5)
  })
})

describe("resolveConfig secondaryForegroundColor", () => {
  it("defaults to empty", () => {
    expect(resolveConfig({}).secondaryForegroundColor).toBe("")
  })

  it("normalizes a second foreground tint", () => {
    expect(resolveConfig({ secondaryForegroundColor: "#A855F7" }).secondaryForegroundColor).toBe(
      "#a855f7",
    )
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

describe("resolveConfig maxFps", () => {
  it("defaults maxFps to 60", () => {
    expect(resolveConfig({}).maxFps).toBe(60)
  })

  it("accepts an explicit cap", () => {
    expect(resolveConfig({ maxFps: 30 }).maxFps).toBe(30)
  })

  it("treats 0 as uncapped", () => {
    expect(resolveConfig({ maxFps: 0 }).maxFps).toBe(0)
  })

  it("clamps negative values to 0", () => {
    expect(resolveConfig({ maxFps: -5 }).maxFps).toBe(0)
  })
})
