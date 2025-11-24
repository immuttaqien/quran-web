"use client"

import { createContext, useContext } from "react"
import useQueryParams from "@/hooks/use-query-params"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"

const SectionTabsContext = createContext<{ queryKey: string }>({
  queryKey: "",
})

interface SectionTabsProps extends React.PropsWithChildren {
  queryKey: string
  value?: string
  className?: string
}

export function SectionTabs({
  queryKey,
  value,
  children,
  className,
}: SectionTabsProps) {
  return (
    <SectionTabsContext.Provider value={{ queryKey }}>
      <Tabs value={value}>
        <TabsList
          className={cn(
            "h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 text-foreground",
            className
          )}>
          {children}
        </TabsList>
      </Tabs>
    </SectionTabsContext.Provider>
  )
}

interface SectionTabsItemProps extends React.PropsWithChildren {
  value: string
  className?: string
  icon?: React.ElementType
  badge?: string | number
}

export function SectionTabsItem({
  value,
  className,
  icon: Icon,
  badge,
  children,
}: SectionTabsItemProps) {
  const { updateQueryParams } = useQueryParams()
  const { queryKey } = useContext(SectionTabsContext)

  return (
    <TabsTrigger
      className={cn(
        "after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary",
        className
      )}
      onClick={() => {
        updateQueryParams((query, { reset }) => {
          reset()
          query[queryKey] = value
        })
      }}
      value={value}>
      {Icon ? (
        <Icon
          aria-hidden="true"
          className="-ms-0.5 me-1.5 opacity-60"
          size={16}
        />
      ) : null}
      {children}
      {badge ? (
        <Badge
          className="ms-1.5 min-w-5 bg-primary/15 px-1"
          variant="secondary">
          {badge}
        </Badge>
      ) : null}
    </TabsTrigger>
  )
}
