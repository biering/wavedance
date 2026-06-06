import { parseHexColor } from "../core/color"
import type { DrawOptions, GridLayout } from "../types"
import type { Renderer } from "./renderer"

const BUCKET_COUNT = 32

export class Canvas2DRenderer implements Renderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private readonly buckets: Int32Array[] = Array.from(
    { length: BUCKET_COUNT },
    () => new Int32Array(0),
  )
  private readonly bucketCounts = new Int32Array(BUCKET_COUNT)
  private foregroundRgb = { r: 255, g: 255, b: 255 }
  private lastForeground = ""

  init(container: HTMLElement): void {
    this.canvas = document.createElement("canvas")
    this.canvas.style.display = "block"
    this.canvas.style.width = "100%"
    this.canvas.style.height = "100%"
    this.canvas.style.pointerEvents = "none"

    const ctx = this.canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      throw new Error("Failed to get 2D canvas context")
    }

    this.ctx = ctx
    container.appendChild(this.canvas)
  }

  resize(width: number, height: number, dpr: number): void {
    if (!this.canvas) return

    const pixelWidth = Math.max(1, Math.floor(width * dpr))
    const pixelHeight = Math.max(1, Math.floor(height * dpr))

    this.canvas.width = pixelWidth
    this.canvas.height = pixelHeight
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
  }

  draw(grid: GridLayout, intensities: Float32Array, options: DrawOptions): void {
    const ctx = this.ctx
    const canvas = this.canvas
    if (!ctx || !canvas) return

    const { dotSize, foreground, background, dpr } = options
    const count = grid.count
    const dotPixelSize = Math.max(1, dotSize * dpr)

    if (foreground !== this.lastForeground) {
      this.foregroundRgb = parseHexColor(foreground)
      this.lastForeground = foreground
    }

    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.bucketDots(count, intensities)

    const { r, g, b } = this.foregroundRgb
    const rgb = `rgb(${r},${g},${b})`
    ctx.fillStyle = rgb

    for (let bucket = 0; bucket < BUCKET_COUNT; bucket++) {
      const bucketSize = this.bucketCounts[bucket]
      if (bucketSize === 0) continue

      const alpha = (bucket + 0.5) / BUCKET_COUNT
      if (alpha < 0.02) continue

      ctx.globalAlpha = alpha
      const indices = this.buckets[bucket]

      for (let i = 0; i < bucketSize; i++) {
        const idx = indices[i]
        const x = grid.x[idx] - dotPixelSize / 2
        const y = grid.y[idx] - dotPixelSize / 2
        ctx.fillRect(x, y, dotPixelSize, dotPixelSize)
      }
    }

    ctx.globalAlpha = 1
  }

  private bucketDots(count: number, intensities: Float32Array): void {
    this.bucketCounts.fill(0)

    for (let i = 0; i < count; i++) {
      const intensity = intensities[i]
      if (intensity <= 0) continue

      const bucket = Math.min(BUCKET_COUNT - 1, Math.floor(intensity * BUCKET_COUNT))
      const bucketArray = this.buckets[bucket]
      const bucketIndex = this.bucketCounts[bucket]

      if (bucketIndex >= bucketArray.length) {
        const newSize = bucketArray.length === 0 ? 64 : bucketArray.length * 2
        const grown = new Int32Array(newSize)
        grown.set(bucketArray)
        this.buckets[bucket] = grown
      }

      this.buckets[bucket][bucketIndex] = i
      this.bucketCounts[bucket]++
    }
  }

  destroy(): void {
    if (this.canvas?.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
    this.canvas = null
    this.ctx = null
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas
  }
}
