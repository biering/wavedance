/** Set all dots to full opacity. */
export function computeNoneField(intensities: Float32Array, count: number): void {
  for (let i = 0; i < count; i++) {
    intensities[i] = 1
  }
}
