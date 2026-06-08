import type { AnimationType, WavedanceConfig } from "wavedance"

export const defaultControlsState = {
  dotSize: 1,
  gap: 10,
  foreground: "#7c7c7c",
  foregroundOpacity: 1,
  background: "#161616",
  backgroundOpacity: 1,
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
  foregroundOpacity: defaultControlsState.foregroundOpacity,
  background: defaultControlsState.background,
  backgroundOpacity: defaultControlsState.backgroundOpacity,
  animation: defaultControlsState.animation,
  wave: {
    scale: defaultControlsState.waveScale,
    speed: defaultControlsState.waveSpeed,
    threshold: defaultControlsState.waveThreshold,
    softness: defaultControlsState.waveSoftness,
  },
}
