"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import RangeCalendar, {
  normalizeRange,
  type RangeCalendarProps,
  type RangeValue,
} from "./range-calendar"

export type DateRangePickerProps = Omit<
  ComponentProps<typeof Button>,
  "onSelect"
> & {
  align?: "start" | "center" | "end"
  selected?: DateRange | null
  onSelectRange?: (range: DateRange | null) => void
  onApply?: (range: DateRange | null) => void
  onClear?: () => void
  placeholder?: string
  disabledDate?: RangeCalendarProps["disabled"]
  defaultValue?: RangeValue
  startMonth?: Date
  endMonth?: Date
  numberOfMonths?: number
  nameFrom?: string
  nameTo?: string
}

export function DateRangePicker({
  align = "start",
  selected,
  onSelectRange,
  onApply,
  onClear,
  className,
  placeholder,
  disabledDate,
  defaultValue,
  startMonth,
  endMonth,
  numberOfMonths,
  nameFrom = "dateFrom",
  nameTo = "dateTo",
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const isControlled = selected !== undefined
  const [internalRange, setInternalRange] = useState<DateRange | null>(() =>
    normalizeRange(defaultValue)
  )

  const currentRange = isControlled ? selected : internalRange

  const formattedLabel = useMemo(() => {
    if (currentRange?.from && currentRange?.to) {
      const sameDay =
        currentRange.from.toDateString() === currentRange.to.toDateString()
      if (sameDay) {
        return format(currentRange.from, "PPP", { locale: id })
      }
      return `${format(currentRange.from, "PPP", { locale: id })} - ${format(currentRange.to, "PPP", { locale: id })}`
    }

    if (currentRange?.from) {
      return format(currentRange.from, "PPP", { locale: id })
    }

    if (currentRange?.to) {
      return format(currentRange.to, "PPP", { locale: id })
    }

    return placeholder || "Pilih tanggal"
  }, [currentRange, placeholder])

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <input
        className="hidden"
        name={nameFrom}
        readOnly
        type="text"
        value={
          currentRange?.from ? format(currentRange.from, "yyyy-MM-dd") : ""
        }
      />
      <input
        className="hidden"
        name={nameTo}
        readOnly
        type="text"
        value={currentRange?.to ? format(currentRange.to, "yyyy-MM-dd") : ""}
      />
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "group justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]",
            !currentRange?.from && !currentRange?.to && "text-muted-foreground",
            className
          )}
          variant="outline"
          {...props}>
          <span
            className={cn(
              "truncate",
              !currentRange?.from &&
                !currentRange?.to &&
                "text-muted-foreground"
            )}>
            {formattedLabel}
          </span>
          <CalendarIcon
            aria-hidden="true"
            className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
            size={16}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-2">
        <RangeCalendar
          defaultValue={defaultValue}
          disabled={disabledDate}
          endMonth={endMonth}
          numberOfMonths={numberOfMonths}
          onApply={(range) => {
            setInternalRange(range)
            onSelectRange?.(range)
            onApply?.(range)

            setOpen(false)
          }}
          onClear={() => {
            setInternalRange(null)
            onSelectRange?.(null)
            onClear?.()

            setOpen(false)
          }}
          onSelect={(range) => {
            setInternalRange(range)
            onSelectRange?.(range)
          }}
          selected={currentRange}
          startMonth={startMonth}
        />
      </PopoverContent>
    </Popover>
  )
}
