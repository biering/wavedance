import { type WavedanceConfig, createWavedance } from "@maelstrom/wavedance"
import { useEffect, useRef } from "react"
import { defaultWavedanceConfig } from "../defaults"
import { Controls } from "./Controls"

export function Demo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<ReturnType<typeof createWavedance> | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const instance = createWavedance(container, defaultWavedanceConfig)
    instanceRef.current = instance

    return () => {
      instance.destroy()
      instanceRef.current = null
    }
  }, [])

  const handleChange = (config: Partial<WavedanceConfig>) => {
    instanceRef.current?.update(config)
  }

  return (
    <div className="demo">
      <div ref={containerRef} className="demo__canvas" aria-hidden="true" />
      <div className="demo__panel">
        <Controls onChange={handleChange} />
      </div>

      <style>{`
        .demo {
          position: relative;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .demo__canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .demo__panel {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: flex-end;
          padding: 1.5rem;
          pointer-events: none;
        }

        .demo__panel > * {
          pointer-events: auto;
        }
      `}</style>
    </div>
  )
}
