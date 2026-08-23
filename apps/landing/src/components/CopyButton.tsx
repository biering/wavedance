import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import { useRef, useState } from "react"

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number>(0)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "copied" : "copy"}
      className={cn(
        "text-quiet hover:text-ink inline-flex rounded-md p-1 transition-colors duration-150",
        className,
      )}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}
