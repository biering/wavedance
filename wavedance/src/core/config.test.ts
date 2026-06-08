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
