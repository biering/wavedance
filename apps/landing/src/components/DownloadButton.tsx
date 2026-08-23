import { cn } from "@/lib/utils"
import { Download } from "lucide-react"

export function DownloadButton({
  text,
  filename,
  className,
}: {
  text: string
  filename: string
  className?: string
}) {
  const download = () => {
    const blob = new Blob([text], { type: "text/javascript;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      aria-label="download"
      className={cn(
        "text-quiet hover:text-ink inline-flex rounded-md p-1 transition-colors duration-150",
        className,
      )}
    >
      <Download size={14} />
    </button>
  )
}
