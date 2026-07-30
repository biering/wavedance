import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createWavedance } from "./wavedance"

class MockResizeObserver {
  static instances: MockResizeObserver[] = []
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()

  constructor(_callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this)
  }
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()

  constructor(_callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this)
  }
}

function mockCanvasContext(): CanvasRenderingContext2D {
  return {
    fillStyle: "",
    globalAlpha: 1,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe("createWavedance", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    MockResizeObserver.instances = []
    MockIntersectionObserver.instances = []

    vi.stubGlobal("ResizeObserver", MockResizeObserver)
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCanvasContext())

    container = document.createElement("div")
    Object.defineProperty(container, "clientWidth", { value: 400, configurable: true })
    Object.defineProperty(container, "clientHeight", { value: 300, configurable: true })
    container.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("mounts a canvas inside the container", () => {
    const instance = createWavedance(container, { animation: "wave" })
    const canvas = container.querySelector("canvas")
    expect(canvas).not.toBeNull()
    expect(canvas?.style.width).toBe("400px")
    expect(canvas?.style.height).toBe("300px")
    instance.destroy()
  })

  it("updates configuration at runtime", () => {
    const instance = createWavedance(container, { animation: "random", dotSize: 2 })
    instance.update({
      animation: "wave",
      dotSize: 4,
      foregroundOpacity: 0.5,
      backgroundOpacity: 0.8,
    })
    const config = instance.getConfig()
    expect(config.animation).toBe("wave")
    expect(config.dotSize).toBe(4)
    expect(config.foregroundOpacity).toBe(0.5)
    expect(config.backgroundOpacity).toBe(0.8)
    instance.destroy()
  })

  it("destroy removes canvas and disconnects observers", () => {
    const instance = createWavedance(container, { animation: "wave" })
    expect(container.querySelector("canvas")).not.toBeNull()

    instance.destroy()

    expect(container.querySelector("canvas")).toBeNull()
    expect(MockResizeObserver.instances[0]?.disconnect).toHaveBeenCalled()
    expect(MockIntersectionObserver.instances[0]?.disconnect).toHaveBeenCalled()
  })

  it("throws when container is missing", () => {
    expect(() => createWavedance(null as unknown as HTMLElement)).toThrow(
      /requires a container element/,
    )
  })

  it("draws once and then idles when prefers-reduced-motion is set", () => {
    const clearRect = vi.fn()
    const ctx = {
      fillStyle: "",
      globalAlpha: 1,
      fillRect: vi.fn(),
      clearRect,
    } as unknown as CanvasRenderingContext2D
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx)
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const scheduled: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => scheduled.push(cb))
    vi.stubGlobal("cancelAnimationFrame", vi.fn())

    const instance = createWavedance(container, { animation: "wave", respectReducedMotion: true })
    for (let i = 0; i < 5; i++) {
      const next = scheduled[scheduled.length - 1]
      if (next) next(i * 16)
    }

    // A single static frame, not one per animation frame.
    expect(clearRect).toHaveBeenCalledTimes(1)
    instance.destroy()
  })
})
