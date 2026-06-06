import { resolveConfig } from "./core/config"
import { FieldComputer } from "./core/field"
import { buildGrid } from "./core/grid"
import { Canvas2DRenderer } from "./render/canvas2d"
import type {
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

  let rafId = 0
  let running = false
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
    if (resolved.animation === "none") return false
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
    renderer.draw(grid, intensities, {
      dotSize: resolved.dotSize,
      foreground: resolved.foreground,
      background: resolved.background,
      dpr: resolved.devicePixelRatio,
    })
  }

  const loop = (time: number): void => {
    if (!running) return

    if (shouldAnimate()) {
      drawFrame(time)
    } else if (grid) {
      drawFrame(time)
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
      }
      resolved = resolveConfig(merged)
      field.updateConfig(resolved)

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
      }
    },
  }
}
