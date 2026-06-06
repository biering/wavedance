# wavedance

A high-performance animated dot-grid canvas library.

**Live demo:** [biering.github.io/wavedance](https://biering.github.io/wavedance/)

## Packages

- [`wavedance`](./wavedance) — framework-agnostic canvas library
- [`landing`](./apps/landing) — Astro + React demo site ([live example](https://biering.github.io/wavedance/))

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
2. Release Please opens a release PR that bumps `wavedance` and updates `CHANGELOG.md`.
3. Merge the release PR to tag the release (`wavedance-v*`) and create a GitHub release.
4. The [Publish npm](.github/workflows/publish-npm.yml) workflow runs on `release: published` to test, build, and publish to npm.

## License

MIT
