# wavedance

A high-performance animated dot-grid canvas library.

## Packages

- [`@maelstrom/wavedance`](./packages/wavedance) — framework-agnostic canvas library
- [`landing`](./apps/landing) — Astro + React demo site

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm ci
```

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please) on the `main` branch.

1. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `feat!:` for breaking changes).
2. Release Please opens a release PR that bumps `@maelstrom/wavedance` and updates `CHANGELOG.md`.
3. Merge the release PR to tag the release (`wavedance-v*`), create a GitHub release, and publish to npm.

Required GitHub secrets:

- `NPM_TOKEN` — npm automation token for `@maelstrom/wavedance`
- `RELEASE_PLEASE_TOKEN` (optional) — PAT so CI runs on release PRs; falls back to `GITHUB_TOKEN`

## License

MIT
