/**
 * Seeded 3D Simplex noise implementation.
 * Self-contained, deterministic, and portable to Rust.
 */
export class SimplexNoise {
  private readonly perm: Uint8Array
  private readonly permMod12: Uint8Array

  private static readonly grad3 = new Float32Array([
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1,
    1, 0, 1, -1, 0, -1, -1,
  ])

  constructor(seed = 0) {
    const source = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      source[i] = i
    }

    let state = (seed ^ 0x9e3779b9) >>> 0
    if (state === 0) {
      state = 1
    }
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0
      return state / 4294967296
    }

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      const tmp = source[i]
      source[i] = source[j]
      source[j] = tmp
    }

    this.perm = new Uint8Array(512)
    this.permMod12 = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = source[i & 255]
      this.permMod12[i] = this.perm[i] % 12
    }
  }

  /** Returns noise in approximately [-1, 1]. */
  noise3(x: number, y: number, z: number): number {
    const grad3 = SimplexNoise.grad3
    const perm = this.perm
    const permMod12 = this.permMod12

    const F3 = 1 / 3
    const G3 = 1 / 6

    const s = (x + y + z) * F3
    const i = Math.floor(x + s)
    const j = Math.floor(y + s)
    const k = Math.floor(z + s)

    const t = (i + j + k) * G3
    const x0 = x - (i - t)
    const y0 = y - (j - t)
    const z0 = z - (k - t)

    let i1: number
    let j1: number
    let k1: number
    let i2: number
    let j2: number
    let k2: number

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1
        j1 = 0
        k1 = 0
        i2 = 1
        j2 = 1
        k2 = 0
      } else if (x0 >= z0) {
        i1 = 1
        j1 = 0
        k1 = 0
        i2 = 1
        j2 = 0
        k2 = 1
      } else {
        i1 = 0
        j1 = 0
        k1 = 1
        i2 = 1
        j2 = 0
        k2 = 1
      }
    } else if (y0 < z0) {
      i1 = 0
      j1 = 0
      k1 = 1
      i2 = 0
      j2 = 1
      k2 = 1
    } else if (x0 < z0) {
      i1 = 0
      j1 = 1
      k1 = 0
      i2 = 0
      j2 = 1
      k2 = 1
    } else {
      i1 = 0
      j1 = 1
      k1 = 0
      i2 = 1
      j2 = 1
      k2 = 0
    }

    const x1 = x0 - i1 + G3
    const y1 = y0 - j1 + G3
    const z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2 * G3
    const y2 = y0 - j2 + 2 * G3
    const z2 = z0 - k2 + 2 * G3
    const x3 = x0 - 1 + 3 * G3
    const y3 = y0 - 1 + 3 * G3
    const z3 = z0 - 1 + 3 * G3

    const ii = i & 255
    const jj = j & 255
    const kk = k & 255

    let n0 = 0
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    if (t0 >= 0) {
      const gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3
      t0 *= t0
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0)
    }

    let n1 = 0
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    if (t1 >= 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3
      t1 *= t1
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1)
    }

    let n2 = 0
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    if (t2 >= 0) {
      const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3
      t2 *= t2
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2)
    }

    let n3 = 0
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    if (t3 >= 0) {
      const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3
      t3 *= t3
      n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3)
    }

    return 32 * (n0 + n1 + n2 + n3)
  }

  /** Returns noise in approximately [0, 1]. */
  noise3Normalized(x: number, y: number, z: number): number {
    return this.noise3(x, y, z) * 0.5 + 0.5
  }
}

/** Smooth Hermite interpolation for soft cluster edges. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
