"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import type { Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import SingleCalendar from "./single-calendar"

export function DatePicker({
  align = "start",
  selected,
  onSelectDate,
  className,
  name,
  placeholder,
  disabledDate,
  defaultValue,
  startMonth,
  endMonth,
  ...props
}: Omit<React.ComponentProps<"button">, "defaultValue"> & {
  align?: "start" | "center" | "end"
  selected?: Date | null
  onSelectDate?: (date: Date | null) => void
  placeholder?: string
  disabledDate?: Matcher | Matcher[]
  defaultValue?: string | number
  startMonth?: Date
  endMonth?: Date
}) {
  const [open, setOpen] = useState(false)

  const isControlled = selected !== undefined
  const [date, setDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null
  )

  const currentDate = isControlled ? selected : date

  const today = new Date()

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <input
        className="hidden"
        id="date"
        name={name}
        readOnly
        type="text"
        value={currentDate ? format(currentDate, "yyyy-MM-dd") : ""}
      />
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-input bg-transparent px-3 font-normal outline-none outline-offset-0 hover:bg-transparent hover:text-inherit focus-visible:outline-[3px] data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
            !currentDate && "text-muted-foreground",
            className
          )}
          data-placeholder={!currentDate || undefined}
          role="combobox"
          variant="outline"
          {...props}>
          <span
            className={cn("truncate", !currentDate && "text-muted-foreground")}
            data-slot="select-value">
            {currentDate
              ? format(currentDate, "PPP", { locale: id })
              : placeholder || ""}
          </span>
          <CalendarIcon
            aria-hidden="true"
            className="shrink-0 opacity-50"
            size={16}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-2">
        <SingleCalendar
          defaultValue={currentDate || undefined}
          disabled={disabledDate}
          endMonth={endMonth}
          onClear={() => {
            onSelectDate?.(null)
            setDate(null)
            setOpen(false)
          }}
          onSelect={(date) => {
            onSelectDate?.(date || null)
            setDate(date)
            setOpen(false)
          }}
          onToday={() => {
            onSelectDate?.(today)
            setDate(today)
            setOpen(false)
          }}
          selected={currentDate}
          startMonth={startMonth}
        />
      </PopoverContent>
    </Popover>
  )
}
