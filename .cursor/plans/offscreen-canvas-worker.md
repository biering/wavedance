# Plan: OffscreenCanvas + Web Worker rendering

**Status:** 📋 proposed (not started)
**Motivation:** motion.dev "web animation performance tier list" — the S-tier principle is *get work off the main thread so main-thread blocking can't stutter the animation*. For a Canvas2D library the analog is rendering in a Web Worker via `OffscreenCanvas`. Today the field computation + draw run on the main thread every frame, so heavy main-thread work (React hydration, other JS, long tasks) drops wavedance frames.

## Goal

Run the per-frame field computation and canvas draw in a Web Worker on an `OffscreenCanvas`, so the animation stays smooth under main-thread load. Public API unchanged; graceful fallback where unsupported.

## Constraints / non-goals

- **Public API identical:** `createWavedance(container, config?)` returns the same `WavedanceInstance` (`update` / `destroy` / `getConfig`).
- **Graceful degradation:** if `OffscreenCanvas` / `transferControlToOffscreen` / `Worker` is unavailable, or worker construction throws (e.g. strict CSP `worker-src`), fall back to today's main-thread renderer with zero behavior change.
- **Self-contained npm bundle:** consumers must not have to host a separate worker file. The worker ships inlined.
- Not changing animation math, defaults, or the demo.

## Architecture

Two cooperating drivers sharing the existing compute/render code:

- **Main thread (orchestrator)** — owns the `<canvas>` element and everything DOM/`window`:
  `ResizeObserver`, `IntersectionObserver`, `visibilitychange`, `matchMedia('(prefers-reduced-motion)')`.
  Calls `canvas.transferControlToOffscreen()`, posts the `OffscreenCanvas` + config to the worker, then only posts small messages (resize, config updates, active/idle) thereafter.
- **Worker (renderer)** — owns `buildGrid`, `FieldComputer`, and a canvas-bound `Canvas2DRenderer` drawing to the `OffscreenCanvas`; runs the frame loop. No DOM access.

The gating we already built (visibility / intersection / reduced-motion → animate vs. idle) stays on the main thread and is forwarded to the worker as an `active` flag — the worker's loop draws one static frame then idles, same semantics as `wavedance.ts` today.

## Message protocol

Main → worker:
- `init` `{ canvas: OffscreenCanvas, config: ResolvedWavedanceConfig, width, height }`
- `resize` `{ width, height, dpr }`
- `config` `{ partial: Partial<WavedanceConfig> }`
- `active` `{ value: boolean }`  ← from the visibility/intersection/reduced-motion gate
- `destroy`

Worker → main (optional): `ready`, `error` (triggers main-thread fallback if init fails).

## Refactors required

1. **Renderer binds to a provided canvas.** `Canvas2DRenderer.init` currently does `document.createElement('canvas')`. Split into: main thread creates the DOM canvas; the renderer accepts a `HTMLCanvasElement | OffscreenCanvas` and only gets the 2D context + draws. (`getContext('2d')` exists on both.) The rest of `canvas2d.ts` is already DOM-free.
2. **Extract the frame loop / gate** so the same logic runs either in `wavedance.ts` (fallback) or in the worker. Candidate: a small `Engine` that owns `grid` + `FieldComputer` + renderer + the `idleDrawn` loop, independent of who schedules frames.
3. **Feature detection + config:** add `offscreen?: 'auto' | boolean` (default `'auto'`). `'auto'` uses the worker when supported, else main thread.
4. **Worker bundling:** emit the worker entry and inline it (esbuild/tsup) so the runtime does `new Worker(URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' })))`. Keeps the published package a single import with no extra asset for consumers to serve.

## Open questions to resolve during implementation

- **Frame scheduling inside the worker.** Dedicated workers expose `requestAnimationFrame` in Chromium/Firefox but support is not universal; verify, and fall back to a `setTimeout(…, 1000/60)` driver (or main-thread-posted ticks) where absent. Prefer the worker's own rAF when present so it's vsync-aligned.
- **CSP.** Blob workers can be blocked by `worker-src`. Wrap worker construction in try/catch → main-thread fallback, and consider a `workerUrl` config escape hatch for apps that self-host the worker.
- **`OffscreenCanvas` 2d support matrix.** Chrome/Edge/Firefox: yes. Safari: 16.4+. Older Safari → fallback path (already required).

## Testing

- **Unit:** make the worker's message handling a pure reducer (`state × message → state`) so it's testable without a real worker. Test feature-detection branch by stubbing `OffscreenCanvas`/`Worker` globals.
- **Fallback:** existing `wavedance.test.ts` continues to exercise the main-thread path (jsdom has no `OffscreenCanvas`).
- **Manual:** in Chrome, install an artificial main-thread hog (e.g. a `while` busy-loop or long tasks) and confirm the offscreen animation stays at 60fps while the main-thread build stutters; confirm Safari/unsupported falls back cleanly.

## Risks / trade-offs

- **Worker bundling/inlining** is the main complexity for an npm library — the bulk of the effort.
- Slightly higher memory + a few ms worker spin-up cost.
- Reduced debuggability (worker context).
- Two code paths to maintain (worker + fallback) — mitigated by sharing the `Engine`/renderer/compute code.

## Rollout

Ship behind `offscreen: 'auto'`. Option to default it **off** (opt-in) for one release to validate in the wild, then flip to `'auto'`.

## Effort

Medium–large. Renderer split + shared engine + worker harness + inlined bundling + fallback + tests. Rough estimate: ~1 focused day.
