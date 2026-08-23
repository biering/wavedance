import { withBase } from "@/lib/base"
import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub"
import { ArrowLeft, ArrowRight } from "lucide-react"

const linkClass =
  "text-quiet hover:text-ink inline-flex items-center gap-1.5 text-xs lowercase transition-colors duration-150"

export function SiteNav({ page }: { page: "home" | "editor" }) {
  return (
    <nav className="flex items-center justify-between gap-4" aria-label="links">
      {page === "editor" ? (
        <a href={withBase("/")} className={linkClass}>
          <ArrowLeft size={14} />
          wavedance
        </a>
      ) : (
        <span className="text-xs lowercase text-ink">wavedance</span>
      )}
      <div className="flex items-center gap-3.5">
        <a
          href="https://github.com/biering/wavedance"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className={linkClass}
        >
          <SiGithub size={16} color="currentColor" title="GitHub" />
        </a>
        <a href="https://cbiering.com" target="_blank" rel="noreferrer" className={linkClass}>
          cbiering.com
        </a>
        <a
          href="https://wave.dance"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-ink px-2 py-0.5 text-[0.65rem] lowercase text-ground transition-opacity duration-150 hover:opacity-80"
        >
          mac app
        </a>
        {page === "home" && (
          <a href={withBase("/editor")} className={linkClass}>
            editor
            <ArrowRight size={14} />
          </a>
        )}
      </div>
    </nav>
  )
}
