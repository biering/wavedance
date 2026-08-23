import { type ControlsState, formatSnippet, toWavedanceConfig } from "@/defaults"
import { type Preset, defaultPreset, presets } from "@/presets"
import { useMemo, useState } from "react"
import { CanvasHost } from "./CanvasHost"
import { ConfigSnippet } from "./ConfigSnippet"
import { Controls } from "./Controls"
import { MacAppBadge } from "./MacAppBadge"
import { PresetStrip } from "./PresetStrip"
import { SiteNav } from "./SiteNav"

export function Demo() {
  const [state, setState] = useState<ControlsState>(defaultPreset.state)
  const [presetId, setPresetId] = useState<string | null>(defaultPreset.id)
  const config = useMemo(() => toWavedanceConfig(state), [state])
  const snippet = useMemo(() => formatSnippet(state), [state])

  const applyState = (next: ControlsState) => {
    setState(next)
    setPresetId(null)
  }

  const applyPreset = (preset: Preset) => {
    setState(preset.state)
    setPresetId(preset.id)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <CanvasHost config={config} className="absolute inset-0" />

      <div className="absolute inset-y-0 left-0 z-1 hidden w-[min(100%,28rem)] flex-col gap-6 overflow-y-auto overscroll-contain p-6 md:flex">
        <SiteNav page="editor" />
        <PresetStrip presets={presets} selectedId={presetId} onSelect={applyPreset} />
        <div className="rounded-2xl border border-line bg-raised p-5">
          <ConfigSnippet code={snippet} />
        </div>
        <div className="xl:hidden">
          <MacAppBadge />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-2 hidden justify-center xl:flex">
        <MacAppBadge compact />
      </div>

      <aside className="absolute inset-y-0 right-0 z-1 w-full overflow-y-auto overscroll-contain p-6 md:w-[min(100%,24rem)]">
        <div className="mb-6 flex flex-col gap-6 md:hidden">
          <SiteNav page="editor" />
          <MacAppBadge />
          <PresetStrip presets={presets} selectedId={presetId} onSelect={applyPreset} />
          <div className="rounded-2xl border border-line bg-raised p-5">
            <ConfigSnippet code={snippet} />
          </div>
        </div>
        <Controls state={state} onChange={applyState} />
      </aside>
    </div>
  )
}
