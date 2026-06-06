import type { AnimationType, WavedanceConfig } from "@maelstrom/wavedance"

export const defaultControlsState = {
  dotSize: 1,
  gap: 10,
  foreground: "#aaaaaa",
  background: "#000000",
  animation: "wave" as AnimationType,
  waveScale: 0.004,
  waveSpeed: 0.0003,
  waveThreshold: 0.15,
  waveSoftness: 0.5,
  randomSpeed: 0.8,
}

export const defaultWavedanceConfig: WavedanceConfig = {
  dotSize: defaultControlsState.dotSize,
  gap: defaultControlsState.gap,
  foreground: defaultControlsState.foreground,
  background: defaultControlsState.background,
  animation: defaultControlsState.animation,
  wave: {
    scale: defaultControlsState.waveScale,
    speed: defaultControlsState.waveSpeed,
    threshold: defaultControlsState.waveThreshold,
    softness: defaultControlsState.waveSoftness,
  },
}
