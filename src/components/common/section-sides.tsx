"use client"

import { CheckIcon } from "lucide-react"
import { createContext, useContext } from "react"
import useQueryParams from "@/hooks/use-query-params"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { Toggle } from "../ui/toggle"
import LoadingIcon from "./loading-icon"

const SectionSidesContext = createContext<{
  queryKey: string
  keepQueryParams?: string[]
  value: string
}>({
  queryKey: "",
  value: "",
})

interface SectionSidesProps extends React.PropsWithChildren {
  queryKey: string
  value?: string
  keepQueryParams?: string[]
  className?: string
}

export function SectionSides({
  queryKey,
  value,
  keepQueryParams,
  children,
  className,
}: SectionSidesProps) {
  return (
    <SectionSidesContext.Provider
      value={{
        queryKey,
        value: value || "",
        keepQueryParams,
      }}>
      <aside className="lg:-mx-4 lg:w-1/5">
        <nav
          className={cn(
            "sticky top-0 flex space-x-2 overflow-x-auto lg:flex-col lg:space-x-0 lg:space-y-1",
            className
          )}>
          {children}
        </nav>
      </aside>
    </SectionSidesContext.Provider>
  )
}

interface SectionSidesItemProps extends React.PropsWithChildren {
  value: string
  className?: string
  icon?: React.ElementType
  badge?: string | number
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  checkedLoading?: boolean
}

export function SectionSidesItem({
  value,
  className,
  icon: Icon,
  badge,
  checked,
  onCheckedChange,
  checkedLoading,
  children,
}: SectionSidesItemProps) {
  const { updateQueryParams } = useQueryParams()
  const {
    queryKey,
    value: currentValue,
    keepQueryParams,
  } = useContext(SectionSidesContext)

  return (
    <div className="flex flex-row gap-1">
      <button
        className={cn(
          // buttonVariants({ variant: "ghost" }),
          "flex-1 justify-start text-nowrap rounded-md px-2 text-start text-sm focus:ring-0",
          "h-9 px-4 py-2 has-[>svg]:px-3",
          currentValue === value
            ? "bg-muted hover:bg-muted"
            : "hover:bg-muted/50",
          className
        )}
        onClick={() => {
          updateQueryParams((query, { reset, resetExcept }) => {
            if (keepQueryParams) {
              resetExcept(keepQueryParams)
            } else {
              reset()
            }
            query[queryKey] = value
          })
        }}
        type="button"
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
      </button>
      {checked != null ? (
        <Toggle onPressedChange={onCheckedChange} pressed={checked}>
          <LoadingIcon loading={checkedLoading}>
            <CheckIcon />
          </LoadingIcon>
        </Toggle>
      ) : null}
    </div>
  )
}
