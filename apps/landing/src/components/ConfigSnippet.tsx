import { highlightJavaScript } from "@/lib/highlight"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { CopyButton } from "./CopyButton"
import { DownloadButton } from "./DownloadButton"

export function ConfigSnippet({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    highlightJavaScript(code)
      .then((next) => {
        if (!cancelled) setHtml(next)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-[0.7rem] lowercase tracking-wide text-quiet">your config</span>
      <div className="relative rounded-xl border border-line bg-ground p-4">
        <div className="absolute top-2 right-2 z-10 flex items-center">
          <CopyButton text={code} />
          <DownloadButton text={code} filename="wavedance.js" />
        </div>
        {html ? (
          <div
            className="config-shiki overflow-x-auto pr-12 font-mono text-[0.7rem] leading-relaxed"
            // Highlighted HTML from Shiki — source is our own generated snippet.
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output from our snippet
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto pr-12 font-mono text-[0.7rem] leading-relaxed text-ink/90">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
