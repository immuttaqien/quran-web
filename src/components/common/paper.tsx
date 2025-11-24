"use client"

import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface PaperProps extends React.PropsWithChildren {
  className?: string
  asChild?: boolean
}

export default function Paper({
  children,
  className,
  asChild = false,
}: PaperProps) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        "w-full rounded-2xl border bg-card shadow-sm ring-4 ring-muted dark:ring-0",
        className
      )}
      data-slot="paper">
      {children}
    </Comp>
  )
}
