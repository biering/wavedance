import type { GapConfig, GridLayout } from "../types"

export interface BuildGridOptions {
  width: number
  height: number
  dotSize: number
  gap: GapConfig
  dpr: number
  maxDots: number
}

/**
 * Build a dot grid layout for the given dimensions.
 * Positions are in device pixels (CSS size * dpr).
 */
export function buildGrid(options: BuildGridOptions): GridLayout {
  const { width, height, dotSize, gap, dpr, maxDots } = options

  const cellX = (dotSize + gap.x) * dpr
  const cellY = (dotSize + gap.y) * dpr
  const dotRadius = (dotSize * dpr) / 2

  const cols = Math.max(1, Math.floor((width * dpr) / cellX))
  const rows = Math.max(1, Math.floor((height * dpr) / cellY))
  let count = cols * rows

  if (count > maxDots) {
    const scale = Math.sqrt(maxDots / count)
    const scaledCols = Math.max(1, Math.floor(cols * scale))
    const scaledRows = Math.max(1, Math.floor(rows * scale))
    count = scaledCols * scaledRows

    const x = new Float32Array(count)
    const y = new Float32Array(count)

    const offsetX = (width * dpr - (scaledCols - 1) * cellX) / 2 + dotRadius
    const offsetY = (height * dpr - (scaledRows - 1) * cellY) / 2 + dotRadius

    let index = 0
    for (let row = 0; row < scaledRows; row++) {
      for (let col = 0; col < scaledCols; col++) {
        x[index] = offsetX + col * cellX
        y[index] = offsetY + row * cellY
        index++
      }
    }

    return {
      count,
      cols: scaledCols,
      rows: scaledRows,
      x,
      y,
      width,
      height,
      dpr,
    }
  }

  const x = new Float32Array(count)
  const y = new Float32Array(count)

  const offsetX = (width * dpr - (cols - 1) * cellX) / 2 + dotRadius
  const offsetY = (height * dpr - (rows - 1) * cellY) / 2 + dotRadius

  let index = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      x[index] = offsetX + col * cellX
      y[index] = offsetY + row * cellY
      index++
    }
  }

  return {
    count,
    cols,
    rows,
    x,
    y,
    width,
    height,
    dpr,
  }
}
