import type { DrawOptions, GridLayout } from "../types"

export interface Renderer {
  init(container: HTMLElement): void
  resize(width: number, height: number, dpr: number): void
  draw(grid: GridLayout, intensities: Float32Array, options: DrawOptions): void
  destroy(): void
  getCanvas(): HTMLCanvasElement | null
}
