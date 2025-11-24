import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

interface DotBadgeProps {
  label: string
  className?: string
}

export default function DotBadge({ label, className }: DotBadgeProps) {
  return (
    <Badge className="gap-1.5" variant="outline">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full bg-foreground", className)}></span>
      {label}
    </Badge>
  )
}
