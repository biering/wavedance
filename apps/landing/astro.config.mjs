import react from "@astrojs/react"
import { createRequire } from "node:module"
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"

const require = createRequire(import.meta.url)
const tslibPath = require.resolve("tslib")

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "wavedance"
const site = process.env.GITHUB_ACTIONS
  ? `https://${process.env.GITHUB_REPOSITORY_OWNER ?? "maelstrom"}.github.io/${repoName}`
  : "http://localhost:4321"

export default defineConfig({
  site,
  base: process.env.GITHUB_ACTIONS ? `/${repoName}` : "/",
  integrations: [react()],
  output: "static",

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        tslib: tslibPath,
      },
    },
    optimizeDeps: {
      include: ["tslib", "react-remove-scroll", "use-sidecar"],
    },
    ssr: {
      noExternal: ["radix-ui"],
    },
  },
})
