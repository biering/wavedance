import { describe, expect, it } from "vitest"
import { normalizeHexColor, parseHexColor } from "./color"

describe("color", () => {
  it("parses 6-digit hex", () => {
    expect(parseHexColor("#ff00aa")).toEqual({ r: 255, g: 0, b: 170 })
  })

  it("parses 3-digit hex", () => {
    expect(parseHexColor("#f0a")).toEqual({ r: 255, g: 0, b: 170 })
  })

  it("rejects invalid hex", () => {
    expect(() => parseHexColor("red")).toThrow(/Invalid hex color/)
  })

  it("normalizes hex to lowercase", () => {
    expect(normalizeHexColor("#ABC")).toBe("#abc")
  })
})
