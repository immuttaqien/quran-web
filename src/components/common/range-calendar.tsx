import { id } from "date-fns/locale"
import { useState } from "react"
import type { DateRange, Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type RangeValue = {
  from?: Date | string | number
  to?: Date | string | number
}

export interface RangeCalendarProps {
  selected?: DateRange | null
  onSelect?: (range: DateRange | null) => void
  onClear?: () => void
  onApply?: (range: DateRange | null) => void
  disabled?: Matcher | Matcher[]
  defaultValue?: RangeValue
  startMonth?: Date
  endMonth?: Date
  numberOfMonths?: number
}

function toDate(value?: Date | string | number) {
  if (!value) {
    return undefined
  }

  if (value instanceof Date) {
    return value
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function normalizeRange(value?: RangeValue | null): DateRange | null {
  if (!value) {
    return null
  }

  const from = toDate(value.from)
  const to = toDate(value.to)

  if (!from && !to) {
    return null
  }

  return { from, to }
}

export default function RangeCalendar({
  selected,
  onSelect,
  onClear,
  onApply,
  disabled,
  defaultValue,
  startMonth,
  endMonth,
  numberOfMonths = 2,
}: RangeCalendarProps) {
  const isControlled = selected !== undefined
  const [range, setRange] = useState<DateRange | null>(() =>
    normalizeRange(defaultValue)
  )

  const currentRange = isControlled ? selected : range
  const defaultMonth =
    currentRange?.from ??
    currentRange?.to ??
    toDate(defaultValue?.from) ??
    toDate(defaultValue?.to) ??
    new Date()

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  return (
    <div>
      <Calendar
        captionLayout="dropdown-years"
        components={{
          DropdownNav: (props) => {
            return (
              <div className="flex w-full items-center justify-center gap-3 [&>span]:font-medium [&>span]:text-sm">
                {props.children}
              </div>
            )
          },
          YearsDropdown: (props) => {
            return (
              <Select
                onValueChange={(value) => {
                  if (props.onChange) {
                    handleCalendarChange(value, props.onChange)
                  }
                }}
                value={String(props.value)}>
                <SelectTrigger className="h-8 w-fit font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                  {props.options?.map((option) => (
                    <SelectItem
                      disabled={option.disabled}
                      key={option.value}
                      value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          },
        }}
        defaultMonth={defaultMonth}
        disabled={disabled}
        endMonth={endMonth || new Date(2100, 6)}
        footer={
          <div className="flex justify-end gap-2 border-t pt-2">
            <Button
              onClick={() => {
                setRange(null)
                onClear?.()
              }}
              size="sm"
              variant="ghost">
              Kosongkan
            </Button>
            <Button
              onClick={() => {
                onApply?.(currentRange)
              }}
              size="sm"
              variant="ghost">
              Terapkan
            </Button>
          </div>
        }
        locale={id}
        mode="range"
        numberOfMonths={numberOfMonths}
        onSelect={(selectedRange) => {
          setRange(selectedRange || null)
          onSelect?.(selectedRange || null)
        }}
        selected={currentRange || undefined}
        startMonth={startMonth || new Date(1900, 6)}
      />
    </div>
  )
}

export { normalizeRange, toDate }
