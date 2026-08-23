import { type ControlsState, formatSnippet, toWavedanceConfig } from "@/defaults"
import { withBase } from "@/lib/base"
import { type Preset, defaultPreset, presets } from "@/presets"
import { ArrowRight } from "lucide-react"
import { useMemo, useState } from "react"
import { CanvasHost } from "./CanvasHost"
import { ConfigSnippet } from "./ConfigSnippet"
import { InstallCommand } from "./InstallCommand"
import { MacAppBadge } from "./MacAppBadge"
import { PresetStrip } from "./PresetStrip"
import { SiteNav } from "./SiteNav"

export function Landing() {
  const [state, setState] = useState<ControlsState>(defaultPreset.state)
  const [presetId, setPresetId] = useState<string | null>(defaultPreset.id)
  const config = useMemo(() => toWavedanceConfig(state), [state])
  const snippet = useMemo(() => formatSnippet(state), [state])

  const applyPreset = (preset: Preset) => {
    setState(preset.state)
    setPresetId(preset.id)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ground">
      <div className="left-panel flex h-full w-full max-w-lg shrink-0 flex-col overflow-y-auto overscroll-contain">
        <div className="flex min-h-full flex-col gap-10 px-6 py-8">
          <SiteNav page="home" />

          <header className="flex flex-col gap-2">
            <h1 className="text-2xl lowercase tracking-tight text-ink">wavedance</h1>
            <p className="max-w-sm text-sm lowercase leading-relaxed text-quiet">
              high-performance animated dot-grid canvas background. no dependencies — drop a
              container on the page and the grid fills it.
            </p>
          </header>

          <MacAppBadge />

          <div className="rounded-2xl border border-line bg-raised p-5">
            <InstallCommand />
          </div>

          <PresetStrip presets={presets} selectedId={presetId} onSelect={applyPreset} />

          <div className="rounded-2xl border border-line bg-raised p-5">
            <ConfigSnippet code={snippet} />
          </div>

          <a
            href={withBase("/editor")}
            className="text-quiet hover:text-ink inline-flex items-center gap-1.5 text-sm lowercase transition-colors duration-150"
          >
            tune it in the editor
            <ArrowRight size={14} />
          </a>

          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-6">
            <div className="flex flex-col gap-1">
              <dt className="text-[0.65rem] lowercase text-quiet">animations</dt>
              <dd className="text-lg text-ink">5</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[0.65rem] lowercase text-quiet">dependencies</dt>
              <dd className="text-lg text-ink">0</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[0.65rem] uppercase text-quiet">license</dt>
              <dd className="text-lg uppercase text-ink">mit</dd>
            </div>
          </dl>

          <p className="text-[0.7rem] lowercase text-quiet">
            pauses when off-screen, the tab is hidden, or you prefer reduced motion. mit licensed —
            the grid on this page is running in your browser.
          </p>

          <nav className="flex gap-4 pb-4" aria-label="legal">
            <a
              href="https://wave.dance/imprint"
              target="_blank"
              rel="noreferrer"
              className="text-quiet hover:text-ink text-[0.7rem] lowercase transition-colors duration-150"
            >
              imprint
            </a>
            <a
              href="https://wave.dance/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-quiet hover:text-ink text-[0.7rem] lowercase transition-colors duration-150"
            >
              privacy
            </a>
          </nav>
        </div>
      </div>

      <CanvasHost config={config} className="hidden h-full min-w-0 flex-1 md:block" />
    </div>
  )
}
