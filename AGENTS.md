# AGENTS.md

Guidance for AI agents working in the **wavedance** monorepo.

## Project overview

Wavedance is a high-performance animated dot-grid canvas library. This repo contains:

| Path | Package | Purpose |
|------|---------|---------|
| `wavedance` | `wavedance` | Framework-agnostic canvas library (published to npm) |
| `apps/landing` | `landing` | Astro + React marketing/demo site |

The library is the source of truth for animation behavior. The desktop app wraps it as a live wallpaper; the landing site demos it on the web.

## Toolchain

- **Package manager:** pnpm 10 (workspace). Always use `pnpm`, not npm/yarn.
- **Node:** ≥ 22 (root `engines`; Astro 6 requires ≥ 22.12.0). CI runs Node 22.
- **Lint/format:** Biome — not ESLint/Prettier.
- **TypeScript:** ESM (`"type": "module"`) everywhere in JS/TS packages.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) — release-please only bumps `wavedance` today.

## Commands

```bash
pnpm install                  # install all workspaces
pnpm ci                       # format check + lint + typecheck + test + build (all packages)
pnpm --filter wavedance test   # library unit tests (Vitest)
pnpm --filter wavedance dev     # library watch build
pnpm --filter desktop dev                  # Tauri dev (macOS)
pnpm --filter desktop vite:build           # frontend-only build (no Rust bundle)
pnpm --filter landing dev                  # Astro dev server
```

Rust (desktop backend only):

```bash
cd apps/desktop/src-tauri && cargo build
```

## Code style

Follow Biome settings in `biome.json`:

- 2-space indent, 100-char line width
- Semicolons: as needed
- Organize imports on save/format

General principles:

- **Minimize scope.** Match surrounding code; don't refactor unrelated files.
- **Keep `wavedance` framework-agnostic.** No React, Tauri, or DOM assumptions beyond canvas/container APIs.
- **Prefer editing existing abstractions** over adding one-off helpers.
- **Comments** only for non-obvious logic — the code should read clearly on its own.
- **Tests** belong in `wavedance` (Vitest). Add tests for library behavior changes; don't add trivial tests.

## Repository layout

```
wavedance/src/
  wavedance.ts          # public entry: createWavedance()
  types.ts              # WavedanceConfig, WavedanceInstance, etc.
  core/                 # config resolution, grid, noise, field, color
  animations/           # wave, random, plasma
  render/               # Canvas2D renderer

apps/desktop/src/
  wallpaper.tsx         # wallpaper window — listens for config-changed events
  settings.tsx          # settings UI
  license.tsx           # license activation UI
  config.ts             # frontend config load/save + mapping to WavedanceConfig
  defaults.ts           # shared default values (keep in sync with Rust defaults)

apps/desktop/src-tauri/src/
  lib.rs                # Tauri commands + app setup
  app_config.rs         # persisted config (tauri-plugin-store) + config-changed emit
  tray.rs               # menu bar tray icon and license gating
  wallpaper.rs          # macOS desktop window level / sizing
  license.rs            # Polar license activation, validation, keychain storage
  state.rs              # licensed flag + tray menu handle refs
```

## `wavedance` (library)

- **Public API:** `createWavedance(container, config?)` → `{ update, destroy, getConfig }`.
- **Build:** tsup → `dist/` (ESM + CJS + types). Do not import from `src/` outside this package.
- **Performance matters.** Animation runs every frame; avoid allocations in hot paths.
- **Defaults** live in `core/config.ts`. If you change defaults, update `apps/desktop/src/defaults.ts` and `app_config.rs` `Default` impl to match.
- **Breaking API changes** require a major version bump and conventional commit with `!` (e.g. `feat!:`).

## Desktop app (Tauri 2)

### Platform

- **macOS only** for wallpaper functionality (`wallpaper.rs` sets desktop window level via objc2).
- App runs as an **accessory** (no dock icon). Primary UX is the **menu bar tray**.
- Three webview windows: `wallpaper`, `settings`, `license` (see `tauri.conf.json`).

### Frontend ↔ backend config sync

1. Settings UI reads/writes config via `@tauri-apps/plugin-store` (`config.ts`).
2. Rust tray actions read/write the same store (`app_config.rs`).
3. Changes emit a `config-changed` event with a `WavedanceConfig`-shaped payload.
4. `wallpaper.tsx` listens and calls `instance.update(payload)`.

When adding config fields, update **all four**: `types.ts` (if library-level), `defaults.ts`, `config.ts`, `app_config.rs`, and the settings UI.

### Rust conventions

- Use concrete `AppHandle` (Tauri Wry runtime), **not** generic `AppHandle<R: Runtime>`. The rest of the codebase is monomorphic.
- Tauri **2.x** APIs — do not use removed v1 patterns (e.g. `TrayIcon::show_menu()`; use `show_menu_on_left_click` on the builder instead).
- Bundle icons must be **RGBA PNG** (`icons/icon.png`, `icons/trayTemplate.png`).
- Tauri crate features in use: `tray-icon`, `macos-private-api`, `image-png`.

### Licensing (handle with care)

- Polar integration in `license.rs` — activation, validation, deactivation via customer-portal API.
- License record stored in macOS Keychain (`keyring` v3 — use `delete_credential()`, not `delete_password()`).
- Config in `apps/desktop/src-tauri/polar.json` (organization ID, checkout URL, API base).
- **Do not** weaken license gating, remove machine binding, or expose secrets without explicit approval.

## Landing app

- Astro 6 + React 19 + Tailwind 4 — same UI component patterns as desktop (`components/ui/`).
- Imports `wavedance` from the workspace. Run `pnpm build` on the library before landing builds if types/dist are stale.

## CI and releases

- **CI** (`.github/workflows/ci.yml`): Biome format + lint, typecheck, test, build on Ubuntu with Node 22.
- **Release Please** (`.github/workflows/release-please.yml`) opens release PRs, creates GitHub releases on merge, formats release PRs with Biome, and publishes `wavedance` to npm when a new release is created.
- Full `tauri build` (DMG) requires **macOS** locally; CI does not produce desktop bundles today.

## Sensitive / do-not-casually-change areas

| Area | Why |
|------|-----|
| `license.rs`, `polar.json` | Revenue, activation, keychain |
| `wallpaper.rs` native window config | Breaks wallpaper layering on macOS |
| `wavedance/src/render/` | Performance-critical render loop |
| Published `exports` / bundle config | npm consumers depend on these paths |

## Subagents

Project subagents live in `.cursor/agents/`. The **simplifier** agent reviews for unnecessary complexity after a change is working — invoke it before review on non-trivial diffs.

## Checklist before finishing

1. Run targeted checks for what you changed (`pnpm --filter <pkg> test`, `typecheck`, or `cargo build`).
2. If you changed library defaults or config shape, verify desktop defaults stay aligned.
3. Don't commit unless explicitly asked.
4. Don't add markdown docs the user didn't request.
