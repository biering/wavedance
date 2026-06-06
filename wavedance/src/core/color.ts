const HEX_SHORT = /^#([0-9a-fA-F]{3})$/
const HEX_LONG = /^#([0-9a-fA-F]{6})$/

/** Parse a hex color string into RGB components (0-255). */
export function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const trimmed = hex.trim()

  const shortMatch = HEX_SHORT.exec(trimmed)
  if (shortMatch) {
    const [, value] = shortMatch
    return {
      r: Number.parseInt(value[0] + value[0], 16),
      g: Number.parseInt(value[1] + value[1], 16),
      b: Number.parseInt(value[2] + value[2], 16),
    }
  }

  const longMatch = HEX_LONG.exec(trimmed)
  if (longMatch) {
    const [, value] = longMatch
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    }
  }

  throw new Error(`Invalid hex color: "${hex}". Expected #rgb or #rrggbb.`)
}

/** Validate and normalize a hex color string. */
export function normalizeHexColor(hex: string): string {
  const trimmed = hex.trim().toLowerCase()
  parseHexColor(trimmed)
  return trimmed
}
