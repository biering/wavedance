export const COLOR_TONES = [
  { name: "pastel", l: 0.86, c: 0.085 },
  { name: "pale", l: 0.9, c: 0.028 },
  { name: "mid", l: 0.73, c: 0.135 },
  { name: "deep", l: 0.62, c: 0.165 },
  { name: "bright", l: 0.87, c: 0.16 },
  { name: "ink", l: 0.34, c: 0.035 },
] as const

export type ToneName = (typeof COLOR_TONES)[number]["name"]

interface Oklch {
  l: number
  c: number
  h: number
}

function toLinear({ l, c, h }: Oklch): [number, number, number] {
  const r = (h * Math.PI) / 180
  const a = c * Math.cos(r)
  const b = c * Math.sin(r)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const L = l_ * l_ * l_
  const M = m_ * m_ * m_
  const S = s_ * s_ * s_
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ]
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

function resolve(color: Oklch): [number, number, number] {
  let rgb = toLinear(color)
  if (!inGamut(rgb)) {
    let lo = 0
    let hi = color.c
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(toLinear({ ...color, c: mid }))) lo = mid
      else hi = mid
    }
    rgb = toLinear({ ...color, c: lo })
  }
  return rgb.map((v) => Math.min(1, Math.max(0, v))) as [number, number, number]
}

function luminance(color: Oklch): number {
  const [r, g, b] = resolve(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: Oklch, b: Oklch): number {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function ensureContrast(fg: Oklch, bg: Oklch, min: number): Oklch {
  if (contrast(fg, bg) >= min) return fg
  const lean = fg.l >= bg.l ? 1 : -1
  for (const dir of [lean, -lean]) {
    const probe = { ...fg }
    for (let i = 0; i < 60; i++) {
      probe.l = Math.min(1, Math.max(0, probe.l + dir * 0.02))
      if (contrast(probe, bg) >= min) return probe
      if (probe.l === 0 || probe.l === 1) break
    }
  }
  const black = { ...fg, l: 0, c: 0 }
  const white = { ...fg, l: 1, c: 0 }
  return contrast(black, bg) >= contrast(white, bg) ? black : white
}

function toHex(color: Oklch): string {
  return `#${resolve(color)
    .map((v) => {
      const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
      return Math.round(s * 255)
        .toString(16)
        .padStart(2, "0")
    })
    .join("")}`
}

const DARK_SURFACE: Oklch = { l: 0.145, c: 0, h: 0 }
const SURFACE_FLOOR = 1.5

export function toneHex(hue: number, name: ToneName): string {
  const tone = COLOR_TONES.find((t) => t.name === name)
  if (!tone) return "#000000"
  const head = ensureContrast({ l: tone.l, c: tone.c, h: hue * 360 }, DARK_SURFACE, SURFACE_FLOOR)
  return toHex(head)
}
