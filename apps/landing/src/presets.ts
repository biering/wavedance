import { type ControlsState, defaultControlsState } from "./defaults"
import { toneHex } from "./lib/tone"

export interface Preset {
  id: string
  label: string
  state: ControlsState
}

export const presets: Preset[] = [
  {
    id: "flare",
    label: "flare",
    state: {
      ...defaultControlsState,
      dotSize: 4,
      dotSizeVariation: 0.35,
      gap: 10,
      hue: 0.794,
      foreground: "#8073e3",
      foregroundTone: "deep",
      background: "#161616",
      animation: "arc",
      secondaryForegroundColor: "#28e724",
      arcSpeed: 0.6,
      arcCenter: 0.45,
      arcDrop: 0.95,
      arcThickness: 0.35,
      arcCurve: 1.8,
    },
  },
  {
    id: "wave",
    label: "wave",
    state: {
      ...defaultControlsState,
      dotSize: 1,
      dotSizeVariation: 0.3,
      gap: 8,
      foreground: "#484848",
      foregroundTone: null,
      secondaryForegroundColor: "#ffffff",
      background: "#161616",
      animation: "wave",
      waveScale: 0.006,
      waveSpeed: 0.0004,
      waveThreshold: 0.3,
      waveSoftness: 0.4,
    },
  },
  {
    id: "moss",
    label: "moss",
    state: {
      ...defaultControlsState,
      dotSize: 4,
      dotSizeVariation: 0.35,
      gap: 10,
      hue: 0.089,
      foreground: "#e29341",
      foregroundTone: null,
      background: "#161616",
      animation: "plasma",
      plasmaScale: 0.004,
      plasmaSpeed: 0.0003,
      plasmaThreshold: 0.15,
      plasmaSoftness: 0.5,
    },
  },
  {
    id: "ribbon",
    label: "ribbon",
    state: {
      ...defaultControlsState,
      hue: 0.52,
      foreground: "#38d1f5",
      foregroundTone: null,
      background: "#0a0a0b",
      animation: "ribbon",
      dotSize: 3,
      dotSizeVariation: 0.45,
      gap: 8,
      ribbonSpeed: 1,
      ribbonAmplitude: 0.2,
      ribbonThickness: 1.2,
      ribbonSpread: 1,
      ribbonFade: 0.35,
      secondaryForegroundColor: "#a855f7",
    },
  },
  {
    id: "pulse",
    label: "pulse",
    state: {
      ...defaultControlsState,
      hue: 0.12,
      foreground: toneHex(0.12, "pale"),
      foregroundTone: "pale",
      animation: "random",
      randomSpeed: 0.6,
      gap: 14,
      dotSize: 3,
    },
  },
]

export const defaultPreset = presets[0]
