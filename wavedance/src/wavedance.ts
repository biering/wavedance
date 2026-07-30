import { resolveConfig } from "./core/config"
import { FieldComputer } from "./core/field"
import { buildGrid } from "./core/grid"
import { Canvas2DRenderer } from "./render/canvas2d"
import type {
  DrawOptions,
  GridLayout,
  ResolvedWavedanceConfig,
  WavedanceConfig,
  WavedanceInstance,
} from "./types"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function createWavedance(
  container: HTMLElement,
  config: WavedanceConfig = {},
): WavedanceInstance {
  if (!container) {
    throw new Error("createWavedance requires a container element")
  }

  let resolved = resolveConfig(config)
  const renderer = new Canvas2DRenderer()
  renderer.init(container)

  let grid: GridLayout | null = null
  const field = new FieldComputer(resolved.maxDots, resolved)

  // Reused every frame; kept in sync with `resolved` to avoid per-frame allocation.
  const drawOptions: DrawOptions = {
    dotSize: resolved.dotSize,
    dotSizeVariation: resolved.dotSizeVariation,
    foreground: resolved.foreground,
    foregroundOpacity: resolved.foregroundOpacity,
    background: resolved.background,
    backgroundOpacity: resolved.backgroundOpacity,
    dpr: resolved.devicePixelRatio,
  }
  const syncDrawOptions = (): void => {
    drawOptions.dotSize = resolved.dotSize
    drawOptions.dotSizeVariation = resolved.dotSizeVariation
    drawOptions.foreground = resolved.foreground
    drawOptions.foregroundOpacity = resolved.foregroundOpacity
    drawOptions.background = resolved.background
    drawOptions.backgroundOpacity = resolved.backgroundOpacity
    drawOptions.dpr = resolved.devicePixelRatio
  }

  let rafId = 0
  let running = false
  let idleDrawn = false
  let visible = true
  let inView = true
  let startTime = performance.now()
  let lastFrameTime = startTime
  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let motionMediaQuery: MediaQueryList | null = null
  let motionChangeHandler: ((event: MediaQueryListEvent) => void) | null = null
  let visibilityHandler: (() => void) | null = null
  let resizeTimer = 0

  const shouldAnimate = (): boolean => {
    if (resolved.respectReducedMotion && prefersReducedMotion()) return false
    return visible && inView
  }

  const rebuildGrid = (): void => {
    const rect = container.getBoundingClientRect()
    const width = Math.max(1, rect.width)
    const height = Math.max(1, rect.height)
    const dpr = resolved.devicePixelRatio

    grid = buildGrid({
      width,
      height,
      dotSize: resolved.dotSize,
      gap: resolved.gap,
      dpr,
      maxDots: resolved.maxDots,
    })

    renderer.resize(width, height, dpr)
  }

  const drawFrame = (time: number): void => {
    if (!grid) return

    const deltaMs = time - lastFrameTime
    lastFrameTime = time

    const intensities = field.compute(grid, time - startTime, deltaMs)
    renderer.draw(grid, intensities, drawOptions)
  }

  const loop = (time: number): void => {
    if (!running) return

    if (shouldAnimate()) {
      // Resuming from an idle stretch: reset the frame clock so the delta-based
      // animations don't jump on the first frame back.
      if (idleDrawn) lastFrameTime = time
      drawFrame(time)
      idleDrawn = false
    } else if (grid && !idleDrawn) {
      // Not animating (hidden, off-screen, or reduced-motion): draw one static
      // frame, then idle until state changes instead of redrawing every frame.
      drawFrame(time)
      idleDrawn = true
    }

    rafId = requestAnimationFrame(loop)
  }

  const start = (): void => {
    if (running) return
    running = true
    startTime = performance.now()
    lastFrameTime = startTime
    rafId = requestAnimationFrame(loop)
  }

  const stop = (): void => {
    running = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  const scheduleResize = (): void => {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer)
    }
    resizeTimer = window.setTimeout(() => {
      rebuildGrid()
      if (grid) {
        drawFrame(performance.now())
      }
    }, 100)
  }

  rebuildGrid()
  start()

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(container)
  }

  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting)
      },
      { root: null, threshold: 0 },
    )
    intersectionObserver.observe(container)
  }

  if (typeof window !== "undefined") {
    visibilityHandler = () => {
      visible = document.visibilityState === "visible"
    }
    document.addEventListener("visibilitychange", visibilityHandler)

    if (typeof window.matchMedia === "function") {
      motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      motionChangeHandler = () => {
        if (grid) {
          drawFrame(performance.now())
        }
      }
      motionMediaQuery.addEventListener("change", motionChangeHandler)
    }
  }

  return {
    update(partial: Partial<WavedanceConfig>) {
      const merged: WavedanceConfig = {
        ...resolved,
        ...partial,
        wave: partial.wave ? { ...resolved.wave, ...partial.wave } : resolved.wave,
        random: partial.random ? { ...resolved.random, ...partial.random } : resolved.random,
        plasma: partial.plasma ? { ...resolved.plasma, ...partial.plasma } : resolved.plasma,
        flow: partial.flow ? { ...resolved.flow, ...partial.flow } : resolved.flow,
      }
      resolved = resolveConfig(merged)
      field.updateConfig(resolved)
      syncDrawOptions()

      if (
        partial.dotSize !== undefined ||
        partial.gap !== undefined ||
        partial.devicePixelRatio !== undefined ||
        partial.maxDots !== undefined
      ) {
        rebuildGrid()
      }

      if (grid) {
        drawFrame(performance.now())
      }
    },

    destroy() {
      stop()

      if (resizeTimer) {
        window.clearTimeout(resizeTimer)
        resizeTimer = 0
      }

      resizeObserver?.disconnect()
      resizeObserver = null

      intersectionObserver?.disconnect()
      intersectionObserver = null

      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler)
        visibilityHandler = null
      }

      if (motionMediaQuery && motionChangeHandler) {
        motionMediaQuery.removeEventListener("change", motionChangeHandler)
        motionMediaQuery = null
        motionChangeHandler = null
      }

      renderer.destroy()
      grid = null
    },

    getConfig(): ResolvedWavedanceConfig {
      return {
        ...resolved,
        gap: { ...resolved.gap },
        wave: { ...resolved.wave },
        random: { ...resolved.random },
        plasma: { ...resolved.plasma },
        flow: { ...resolved.flow },
      }
    },
  }
}
