import { parseHexColor } from "../core/color"
import type { DrawOptions, GridLayout } from "../types"
import type { Renderer } from "./renderer"

const BUCKET_COUNT = 32
const MIX_BUCKETS = 8
const TINT_BUCKETS = BUCKET_COUNT * MIX_BUCKETS

// At full `dotSizeVariation`, a fully-lit dot grows to this multiple of `dotSize`
// while an unlit dot shrinks toward nothing — so brighter dots read as larger.
const MAX_SIZE_SCALE = 4

function mixFill(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bl = Math.round(a.b + (b.b - a.b) * t)
  return `rgb(${r},${g},${bl})`
}

export class Canvas2DRenderer implements Renderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private readonly buckets: Int32Array[] = Array.from(
    { length: BUCKET_COUNT },
    () => new Int32Array(0),
  )
  private readonly bucketCounts = new Int32Array(BUCKET_COUNT)
  private tintBuckets: Int32Array[] | null = null
  private tintBucketCounts: Int32Array | null = null
  private mixFills: string[] = []
  private foregroundFill = "rgb(255,255,255)"
  private backgroundFill = "rgba(0,0,0,1)"
  private lastForeground = ""
  private lastForeground2 = ""
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
      foreground2,
      tints,
    } = options
    const count = grid.count
    const dotPixelSize = Math.max(1, dotSize * dpr)
    const variableSize = dotSizeVariation > 0
    const mixed = Boolean(foreground2 && tints)

    // Rebuild the fill strings only when colors change, not every frame.
    const foregroundChanged = foreground !== this.lastForeground
    if (foregroundChanged) {
      const { r, g, b } = parseHexColor(foreground)
      this.foregroundFill = `rgb(${r},${g},${b})`
      this.lastForeground = foreground
    }

    if (mixed && (foregroundChanged || foreground2 !== this.lastForeground2)) {
      const a = parseHexColor(foreground)
      const b = parseHexColor(foreground2 as string)
      const last = MIX_BUCKETS - 1
      this.mixFills = Array.from({ length: MIX_BUCKETS }, (_, mix) =>
        mixFill(a, b, last === 0 ? 0 : mix / last),
      )
      this.lastForeground2 = foreground2 as string
    }

    if (background !== this.lastBackground || backgroundOpacity !== this.lastBackgroundOpacity) {
      const { r, g, b } = parseHexColor(background)
      this.backgroundFill = `rgba(${r},${g},${b},${backgroundOpacity})`
      this.lastBackground = background
      this.lastBackgroundOpacity = backgroundOpacity
    }

    if (backgroundOpacity >= 1) {
      // Opaque background fully repaints the frame, so clearRect is redundant.
      ctx.fillStyle = this.backgroundFill
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (backgroundOpacity > 0) {
        ctx.fillStyle = this.backgroundFill
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    if (mixed) {
      this.bucketTintedDots(count, intensities, tints as Float32Array)
      const tintBuckets = this.tintBuckets as Int32Array[]
      const tintCounts = this.tintBucketCounts as Int32Array

      for (let mix = 0; mix < MIX_BUCKETS; mix++) {
        ctx.fillStyle = this.mixFills[mix]
        for (let bucket = 0; bucket < BUCKET_COUNT; bucket++) {
          const key = mix * BUCKET_COUNT + bucket
          const bucketSize = tintCounts[key]
          if (bucketSize === 0) continue

          const alpha = ((bucket + 0.5) / BUCKET_COUNT) * foregroundOpacity
          if (alpha < 0.02) continue

          ctx.globalAlpha = alpha
          this.paintBucket(
            ctx,
            grid,
            intensities,
            tintBuckets[key],
            bucketSize,
            variableSize,
            dotSizeVariation,
            dotPixelSize,
          )
        }
      }
    } else {
      this.bucketDots(count, intensities)
      ctx.fillStyle = this.foregroundFill

      for (let bucket = 0; bucket < BUCKET_COUNT; bucket++) {
        const bucketSize = this.bucketCounts[bucket]
        if (bucketSize === 0) continue

        const alpha = ((bucket + 0.5) / BUCKET_COUNT) * foregroundOpacity
        if (alpha < 0.02) continue

        ctx.globalAlpha = alpha
        this.paintBucket(
          ctx,
          grid,
          intensities,
          this.buckets[bucket],
          bucketSize,
          variableSize,
          dotSizeVariation,
          dotPixelSize,
        )
      }
    }

    ctx.globalAlpha = 1
  }

  private paintBucket(
    ctx: CanvasRenderingContext2D,
    grid: GridLayout,
    intensities: Float32Array,
    indices: Int32Array,
    bucketSize: number,
    variableSize: boolean,
    dotSizeVariation: number,
    dotPixelSize: number,
  ): void {
    if (variableSize) {
      for (let i = 0; i < bucketSize; i++) {
        const idx = indices[i]
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

  private bucketDots(count: number, intensities: Float32Array): void {
    this.bucketCounts.fill(0)

    for (let i = 0; i < count; i++) {
      const intensity = intensities[i]
      if (intensity <= 0) continue

      const bucket = Math.min(BUCKET_COUNT - 1, Math.floor(intensity * BUCKET_COUNT))
      this.pushBucket(this.buckets, this.bucketCounts, bucket, i)
    }
  }

  private bucketTintedDots(count: number, intensities: Float32Array, tints: Float32Array): void {
    if (!this.tintBuckets || !this.tintBucketCounts) {
      this.tintBuckets = Array.from({ length: TINT_BUCKETS }, () => new Int32Array(0))
      this.tintBucketCounts = new Int32Array(TINT_BUCKETS)
    }

    this.tintBucketCounts.fill(0)

    for (let i = 0; i < count; i++) {
      const intensity = intensities[i]
      if (intensity <= 0) continue

      const intensityBucket = Math.min(BUCKET_COUNT - 1, Math.floor(intensity * BUCKET_COUNT))
      const mixBucket = Math.min(MIX_BUCKETS - 1, Math.floor(tints[i] * MIX_BUCKETS))
      const key = mixBucket * BUCKET_COUNT + intensityBucket
      this.pushBucket(this.tintBuckets, this.tintBucketCounts, key, i)
    }
  }

  private pushBucket(
    buckets: Int32Array[],
    counts: Int32Array,
    bucket: number,
    index: number,
  ): void {
    const bucketArray = buckets[bucket]
    const bucketIndex = counts[bucket]

    if (bucketIndex >= bucketArray.length) {
      const newSize = bucketArray.length === 0 ? 64 : bucketArray.length * 2
      const grown = new Int32Array(newSize)
      grown.set(bucketArray)
      buckets[bucket] = grown
    }

    buckets[bucket][bucketIndex] = index
    counts[bucket]++
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
