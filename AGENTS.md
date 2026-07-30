# AGENTS.md

Guidance for AI agents working in the **wavedance** monorepo.

## Project overview

Wavedance is a high-performance animated dot-grid canvas library. This repo contains:

| Path | Package | Purpose |
|------|---------|---------|
| `wavedance` | `wavedance` | Framework-agnostic canvas library (published to npm) |
| `apps/landing` | `landing` | Astro + React marketing/demo site |

The library is the source of truth for animation behavior. The landing site demos it on the web.

## Toolchain

- **Package manager:** pnpm 10 (workspace). Always use `pnpm`, not npm/yarn.
- **Node:** ≥ 22 (root `engines`; CI runs Node 22). The published `wavedance` package targets Node ≥ 18.
- **Lint/format:** Biome — not ESLint/Prettier.
- **TypeScript:** ESM (`"type": "module"`) everywhere.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — release-please only bumps `wavedance` today.

## Commands

```bash
pnpm install                    # install all workspaces
pnpm ci                         # biome ci + typecheck + test + build (all packages)
pnpm build                      # build all packages (recursive)
pnpm --filter wavedance test    # library unit tests (Vitest)
pnpm --filter wavedance dev     # library watch build (tsup)
pnpm --filter landing dev       # Astro dev server
pnpm --filter landing build     # Astro production build (needs library dist built)
```

Note: `pnpm typecheck` builds `wavedance` first (landing consumes its types from `dist/`), then runs `tsc --noEmit` across packages.

## Code style

Follow Biome settings in `biome.json`:

- 2-space indent, 100-char line width
- Semicolons: as needed
- Organize imports on save/format

General principles:

- **Minimize scope.** Match surrounding code; don't refactor unrelated files.
- **Keep `wavedance` framework-agnostic.** No React or DOM assumptions beyond the canvas/container APIs it already uses.
- **Prefer editing existing abstractions** over adding one-off helpers.
- **Comments** only for non-obvious logic — the code should read clearly on its own.
- **Tests** belong in `wavedance` (Vitest, colocated `*.test.ts`). Add tests for library behavior changes; don't add trivial tests.

## Repository layout

```
wavedance/src/
  index.ts              # public exports
  wavedance.ts          # public entry: createWavedance()
  types.ts              # WavedanceConfig, WavedanceInstance, animation options, etc.
  core/                 # config resolution, grid, noise, field, color, rng
  animations/           # wave, random, plasma
  render/               # renderer interface + Canvas2D renderer

apps/landing/src/
  pages/index.astro     # demo page
  components/Demo.tsx    # mounts createWavedance() and wires the controls
  components/Controls.tsx
  components/ui/         # Radix-based UI primitives
  defaults.ts           # landing's default config (mirrors library defaults)
```

## `wavedance` (library)

- **Public API:** `createWavedance(container, config?)` → `{ update, destroy, getConfig }`. `index.ts` also re-exports lower-level building blocks (`buildGrid`, `SimplexNoise`, `resolveConfig`, `Canvas2DRenderer`, color helpers, and the public types).
- **Build:** tsup → `dist/` (ESM + CJS + types). Do not import from `src/` outside this package.
- **Performance matters.** Animation runs every frame via `requestAnimationFrame`; avoid allocations in the `field`/`render` hot paths.
- **Runtime guards:** the loop respects `prefers-reduced-motion`, page visibility, and viewport intersection — preserve these when touching the lifecycle in `wavedance.ts`.
- **Defaults** live in `core/config.ts`. If you change defaults, keep `apps/landing/src/defaults.ts` aligned.
- **Breaking API changes** require a major version bump and a conventional commit with `!` (e.g. `feat!:`).

## Landing app

- Astro 7 + React 19 + Tailwind 4. UI primitives live in `src/components/ui/` (Radix + `class-variance-authority`).
- Imports `wavedance` from the workspace (`workspace:*`). Build the library first if its types/`dist` are stale (`pnpm --filter wavedance build`).
- Deployed to GitHub Pages via `.github/workflows/deploy-landing.yml`.

## CI and releases

- **CI** (`.github/workflows/ci.yml`): Biome format + lint, typecheck, test, build on Ubuntu with Node 22.
- **Release Please** (`.github/workflows/release-please.yml`) opens release PRs, creates GitHub releases on merge, and publishes `wavedance` to npm when a new release is created. Only `wavedance` is versioned today.

## Sensitive / do-not-casually-change areas

| Area | Why |
|------|-----|
| `wavedance/src/render/` and `core/field.ts` | Performance-critical per-frame path |
| Published `exports` / `tsup` bundle config in `wavedance/package.json` | npm consumers depend on these paths |
| `core/config.ts` defaults | Public defaults; landing mirrors them |

## Checklist before finishing

1. Run targeted checks for what you changed (`pnpm --filter <pkg> test`, `pnpm typecheck`).
2. If you changed library defaults or config shape, verify `apps/landing/src/defaults.ts` stays aligned.
3. Don't commit unless explicitly asked.
4. Don't add markdown docs the user didn't request.
