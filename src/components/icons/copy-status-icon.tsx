import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CopyStatusIconProps {
  isCopied: boolean
  className?: string
}

export default function CopyStatusIcon({
  isCopied,
  className,
}: CopyStatusIconProps) {
  return (
    <>
      <div
        className={cn(
          "transition-all",
          isCopied ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
        <CheckIcon
          aria-hidden="true"
          className={cn("stroke-emerald-500", className)}
          size={16}
        />
      </div>
      <div
        className={cn(
          "absolute transition-all",
          isCopied ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}>
        <CopyIcon aria-hidden="true" className={className} size={16} />
      </div>
    </>
  )
}
