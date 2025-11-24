"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface AppCopyButtonProps {
  input: string
}

export default function CopyButton({ input }: AppCopyButtonProps) {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed"
      disabled={copied}
      onClick={handleCopy}
      type="button">
      <div
        className={cn(
          "transition-all",
          copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
        <CheckIcon
          aria-hidden="true"
          className="stroke-emerald-500"
          size={16}
        />
      </div>
      <div
        className={cn(
          "absolute transition-all",
          copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}>
        <CopyIcon aria-hidden="true" size={16} />
      </div>
    </button>
  )
}
