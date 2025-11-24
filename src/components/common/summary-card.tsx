import { cn } from "@/lib/utils"
import { Card } from "../ui/card"

interface SummaryCardProps {
  label?: string
  value?: string | number
  className?: string
}

export default function SummaryCard({
  label,
  value,
  className,
}: SummaryCardProps) {
  return (
    <Card className={cn("gap-1 px-6", className)}>
      <div className="mb-1 text-muted-foreground text-sm">{label}</div>
      <div className="font-bold text-2xl">{value}</div>
    </Card>
  )
}
