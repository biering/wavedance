import type { AnimationType, WavedanceConfig } from "wavedance"

export const defaultControlsState = {
  dotSize: 1,
  dotSizeVariation: 0.3,
  gap: 8,
  foreground: "#7c7c7c",
  foregroundOpacity: 1,
  background: "#161616",
  backgroundOpacity: 1,
  animation: "wave" as AnimationType,
  waveScale: 0.01,
  waveSpeed: 0.001,
  waveThreshold: 0.25,
  waveSoftness: 0.4,
  randomSpeed: 0.8,
  plasmaScale: 0.004,
  plasmaSpeed: 0.0003,
  plasmaThreshold: 0.15,
  plasmaSoftness: 0.5,
  flowScale: 0.006,
  flowSpeed: 0.0004,
}

export const defaultWavedanceConfig: WavedanceConfig = {
  dotSize: defaultControlsState.dotSize,
  dotSizeVariation: defaultControlsState.dotSizeVariation,
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
  plasma: {
    scale: defaultControlsState.plasmaScale,
    speed: defaultControlsState.plasmaSpeed,
    threshold: defaultControlsState.plasmaThreshold,
    softness: defaultControlsState.plasmaSoftness,
  },
  flow: {
    scale: defaultControlsState.flowScale,
    speed: defaultControlsState.flowSpeed,
  },
}
