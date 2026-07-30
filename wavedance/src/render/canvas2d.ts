import { parseHexColor } from "../core/color"
import type { DrawOptions, GridLayout } from "../types"
import type { Renderer } from "./renderer"

const BUCKET_COUNT = 32

// At full `dotSizeVariation`, a fully-lit dot grows to this multiple of `dotSize`
// while an unlit dot shrinks toward nothing — so brighter dots read as larger.
const MAX_SIZE_SCALE = 4

export class Canvas2DRenderer implements Renderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private readonly buckets: Int32Array[] = Array.from(
    { length: BUCKET_COUNT },
    () => new Int32Array(0),
  )
  private readonly bucketCounts = new Int32Array(BUCKET_COUNT)
  private foregroundFill = "rgb(255,255,255)"
  private backgroundFill = "rgba(0,0,0,1)"
  private lastForeground = ""
  private lastBackground = ""
  private lastBackgroundOpacity = Number.NaN

  init(container: HTMLElement): void {
    this.canvas = document.createElement("canvas")
    this.canvas.style.display = "block"
    this.canvas.style.width = "100%"
    this.canvas.style.height = "100%"
    this.canvas.style.pointerEvents = "none"

    const ctx = this.canvas.getContext("2d", { alpha: true })
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

    const {
      dotSize,
      dotSizeVariation,
      foreground,
      foregroundOpacity,
      background,
      backgroundOpacity,
      dpr,
    } = options
    const count = grid.count
    const dotPixelSize = Math.max(1, dotSize * dpr)
    const variableSize = dotSizeVariation > 0

    // Rebuild the fill strings only when colors change, not every frame.
    if (foreground !== this.lastForeground) {
      const { r, g, b } = parseHexColor(foreground)
      this.foregroundFill = `rgb(${r},${g},${b})`
      this.lastForeground = foreground
    }

    if (background !== this.lastBackground || backgroundOpacity !== this.lastBackgroundOpacity) {
      const { r, g, b } = parseHexColor(background)
      this.backgroundFill = `rgba(${r},${g},${b},${backgroundOpacity})`
      this.lastBackground = background
      this.lastBackgroundOpacity = backgroundOpacity
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (backgroundOpacity > 0) {
      ctx.fillStyle = this.backgroundFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    this.bucketDots(count, intensities)

    ctx.fillStyle = this.foregroundFill

    for (let bucket = 0; bucket < BUCKET_COUNT; bucket++) {
      const bucketSize = this.bucketCounts[bucket]
      if (bucketSize === 0) continue

      const alpha = ((bucket + 0.5) / BUCKET_COUNT) * foregroundOpacity
      if (alpha < 0.02) continue

      ctx.globalAlpha = alpha
      const indices = this.buckets[bucket]

      if (variableSize) {
        for (let i = 0; i < bucketSize; i++) {
          const idx = indices[i]
          // Scale size by intensity like opacity: bright dots grow toward
          // MAX_SIZE_SCALE×, faint dots shrink toward 0. `dotSizeVariation`
          // blends between uniform (0) and fully intensity-driven (1).
          const scale = 1 + dotSizeVariation * (intensities[idx] * MAX_SIZE_SCALE - 1)
          const size = dotPixelSize * scale
          if (size < 0.5) continue
          const half = size / 2
          ctx.fillRect(grid.x[idx] - half, grid.y[idx] - half, size, size)
        }
      } else {
        const half = dotPixelSize / 2
        for (let i = 0; i < bucketSize; i++) {
          const idx = indices[i]
          ctx.fillRect(grid.x[idx] - half, grid.y[idx] - half, dotPixelSize, dotPixelSize)
        }
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
