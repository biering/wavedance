# Plan: wave size-scaling, real gaps, flow animation & render optimizations

**Branch:** `feat/wave-scaling-gaps-flow`
**Scope:** `wavedance` library (+ `apps/landing` demo wiring)
**Status:** ✅ implemented — 37 tests, typecheck, lint, format, build all green. Not committed.

## Goal

Three user-facing capabilities plus a hot-path cleanup:

1. Dots that **scale by intensity** — brighter dots grow larger, like opacity.
2. Wave that can produce **real empty spaces** (dots fully on or fully gone).
3. A fourth animation: **flow** (curl-noise field).
4. Remove per-frame waste discovered while reviewing the render loop.

Out of scope (deferred): multi-screen config sync — lives in the desktop/Tauri app, which is not in this repo.

## Design decisions

- **`dotSizeVariation` is a top-level render setting, not wave-specific.** Rendering is animation-agnostic (animations only emit an intensity buffer; the renderer draws it), so size scaling belongs in the renderer and benefits plasma/flow too. Formula couples size to intensity the same way opacity is coupled: `scale = 1 + variation * (intensity * MAX_SIZE_SCALE - 1)`, `MAX_SIZE_SCALE = 4`. At `variation = 0` every dot is uniform `dotSize` (backward compatible); at `1` a fully-lit dot blooms to ~4× and an unlit one vanishes.
- **Wave gaps reuse the plasma pattern** (`smoothstep(threshold, threshold + softness, v)`), gated so `threshold = 0` is a no-op passthrough (preserves the original smooth look).
- **Flow** mirrors plasma's `SimplexNoise` seed/update pattern: a low-frequency noise field sets each dot's flow direction; intensity is a travelling wavefront projected onto that direction → drifting streaks.
- **Shipped defaults updated** to the tuned look: `dotSizeVariation 0.3`, `gap 8`, wave `threshold 0.25`, wave `softness 0.4`. Library `core/config.ts` is canonical; `apps/landing/src/defaults.ts` mirrors it.

## Tasks

### 1. Per-dot size scaling
- [x] `types.ts` — add `dotSizeVariation` to `WavedanceConfig`, `ResolvedWavedanceConfig`, `DrawOptions`.
- [x] `core/config.ts` — resolve + clamp `dotSizeVariation` (default `0.3`).
- [x] `wavedance.ts` — pass it through to `renderer.draw`.
- [x] `render/canvas2d.ts` — per-dot size from exact intensity; `variation = 0` keeps the constant-size fast path; skip sub-0.5px dots.

### 2. Wave real empty spaces
- [x] `types.ts` — add `threshold` + `softness` to `WaveAnimationOptions`.
- [x] `core/config.ts` — defaults `threshold 0.25`, `softness 0.4`.
- [x] `animations/wave.ts` — gate intensity through `smoothstep` only when `threshold > 0`.

### 3. Flow animation
- [x] `types.ts` — `AnimationType += "flow"`, add `FlowAnimationOptions`, `WavedanceConfig.flow`, resolved `flow`.
- [x] `animations/flow.ts` — new `FlowAnimation` (curl-noise field).
- [x] `core/field.ts` — instantiate, `updateConfig`, `case "flow"`.
- [x] `core/config.ts` — flow defaults; `index.ts` — export `FlowAnimationOptions`.

### 4. Demo wiring (`apps/landing`)
- [x] `defaults.ts` — new fields in `defaultControlsState` + `defaultWavedanceConfig`.
- [x] `components/Controls.tsx` — "Size variation" slider, wave Threshold/Softness, "Flow" option + flow sliders.

### 5. Render-loop optimizations
- [x] **Dead animation gating** — `loop()` had two identical `drawFrame` branches, so `shouldAnimate()` (visibility / IntersectionObserver / `prefers-reduced-motion`) did nothing and the canvas redrew at 60fps always. Now gated: one static frame then idle when not animating; frame clock resets on resume.
  - ⚠️ Behavior change: off-screen / reduced-motion backgrounds now freeze instead of animating invisibly (intended, but visible).
- [x] **Per-frame `DrawOptions` allocation** — hoist one object, re-sync only in `update()`.
- [x] **Per-frame fill-string allocation** — cache `rgb()`/`rgba()` fill strings; rebuild only on color/opacity change (field comparison, no key string).

Follow-up pass, audited against motion.dev's web-animation performance tier list (its "deactivate off-screen animations via IntersectionObserver" advice is satisfied by the gating fix above):
- [x] **Cap device pixel ratio** — new `maxDevicePixelRatio` (default 2) bounds the auto-detected DPR so a 3× display doesn't pay 9× the per-frame fill cost. An explicit `devicePixelRatio` opts out.
- [x] **Skip `clearRect` when opaque** — when `backgroundOpacity >= 1` the background `fillRect` already repaints the frame, so the redundant full-canvas `clearRect` is dropped.
- [ ] **OffscreenCanvas + Web Worker** — deferred; see [`offscreen-canvas-worker.md`](./offscreen-canvas-worker.md).

### 6. Tests
- [x] `core/config.test.ts` — new defaults + clamping.
- [x] `animations/wave.test.ts` — gate opens `0` dots (gaps) and reaches `1` (full opacity).
- [x] `animations/flow.test.ts` — range `[0,1]`, determinism per seed, motion over time.
- [x] `wavedance.test.ts` — reduced-motion draws once then idles (regression guard for the gating fix).
- Renderer size-scaling verified headlessly (jsdom canvas has no 2D context, so no unit test).

## Verification

```bash
pnpm --filter wavedance test   # 37 passing
pnpm typecheck
pnpm lint && pnpm format
pnpm build
pnpm --filter landing dev      # eyeball size bloom, wave gaps, flow (hard-refresh: Vite caches the built lib)
```

## Versioning

Additive + backward-compatible API → `feat:` (minor). Default *look* changes (size bloom, gated wave, gap 8) ship with it — a visual change for npm consumers, not an API break.
