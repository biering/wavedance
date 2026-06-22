import type { AnimationType, WavedanceConfig } from "wavedance"

export const defaultControlsState = {
  dotSize: 1,
  gap: 10,
  foreground: "#7c7c7c",
  foregroundOpacity: 1,
  background: "#161616",
  backgroundOpacity: 1,
  animation: "wave" as AnimationType,
  waveScale: 0.01,
  waveSpeed: 0.001,
  randomSpeed: 0.8,
  plasmaScale: 0.004,
  plasmaSpeed: 0.0003,
  plasmaThreshold: 0.15,
  plasmaSoftness: 0.5,
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
  },
  plasma: {
    scale: defaultControlsState.plasmaScale,
    speed: defaultControlsState.plasmaSpeed,
    threshold: defaultControlsState.plasmaThreshold,
    softness: defaultControlsState.plasmaSoftness,
  },
}
