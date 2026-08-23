import { cn } from "@/lib/utils"
import { useState } from "react"
import { CopyButton } from "./CopyButton"

const managers = ["bun", "npm", "pnpm"] as const

const commands: Record<(typeof managers)[number], string> = {
  bun: "bun add wavedance",
  npm: "npm i wavedance",
  pnpm: "pnpm add wavedance",
}

export function InstallCommand({ className }: { className?: string }) {
  const [manager, setManager] = useState<(typeof managers)[number]>("npm")
  const command = commands[manager]

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.7rem] lowercase tracking-wide text-quiet">install</span>
        <div className="flex rounded-full border border-line p-0.5">
          {managers.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setManager(item)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[0.65rem] lowercase transition-colors duration-150",
                manager === item ? "bg-ink text-ground" : "text-quiet hover:text-ink",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="relative rounded-xl border border-line bg-ground px-4 py-3">
        <CopyButton text={command} className="absolute top-2 right-2" />
        <p className="pr-8 font-mono text-[0.75rem] text-ink/90">
          <span className="text-quiet">$</span> {command}
        </p>
      </div>
    </div>
  )
}
