import { cn } from "@/lib/utils"

interface FieldColumnProps extends React.PropsWithChildren {
  col: 2 | 3
  className?: string
}

export default function FieldColumn({
  col,
  className,
  children,
}: FieldColumnProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        col === 2 && "@md:grid-cols-2",
        col === 3 && "@xl:grid-cols-3",
        className
      )}>
      {children}
    </div>
  )
}
