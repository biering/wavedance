import { useEffect, useRef } from "react"
import { type WavedanceConfig, createWavedance } from "wavedance"

export function CanvasHost({
  config,
  className,
  maxDots,
}: {
  config: WavedanceConfig
  className?: string
  maxDots?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<ReturnType<typeof createWavedance> | null>(null)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const instance = createWavedance(container, { ...configRef.current, maxDots })
    instanceRef.current = instance

    return () => {
      instance.destroy()
      instanceRef.current = null
    }
  }, [maxDots])

  useEffect(() => {
    instanceRef.current?.update({ ...config, maxDots })
  }, [config, maxDots])

  return <div ref={ref} className={className} aria-hidden="true" />
}
