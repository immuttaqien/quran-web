import { id } from "date-fns/locale"
import { useState } from "react"
import type { Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SingleCalendarProps {
  selected?: Date | null
  onSelect?: (date: Date | null) => void
  onClear?: () => void
  onToday?: () => void
  disabled?: Matcher | Matcher[]
  defaultValue?: Date | string | number
  startMonth?: Date
  endMonth?: Date
}

export default function SingleCalendar({
  selected,
  onSelect,
  onClear,
  onToday,
  disabled,
  defaultValue,
  startMonth,
  endMonth,
}: SingleCalendarProps) {
  // Presets
  const today = new Date()
  // const yesterday = subDays(today, 1)
  // const next7Days = addDays(today, 6)
  // const next30Days = subDays(today, 29)
  // const monthToDate = startOfMonth(today)
  // const nextMonth = startOfMonth(addMonths(today, 1))
  // const yearToDate = startOfYear(today)
  // const nextYear = startOfYear(addYears(today, 1))

  // const [month, setMonth] = useState(today)
  // const [date, setDate] = useState<Date | undefined>(today)

  const isControlled = selected !== undefined
  const [date, setDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null
  )

  const currentDate = isControlled ? selected : date

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
        defaultMonth={new Date(defaultValue || new Date())}
        disabled={disabled}
        endMonth={endMonth || new Date(2100, 6)}
        footer={
          <div className="flex justify-end gap-2 border-t pt-2">
            <Button
              onClick={() => {
                setDate(null)
                onClear?.()
              }}
              size="sm"
              variant="ghost">
              Kosongkan
            </Button>
            <Button
              onClick={() => {
                setDate(today)
                onToday?.()
              }}
              size="sm"
              variant="ghost">
              Hari ini
            </Button>
          </div>
        }
        locale={id}
        mode="single"
        onSelect={(date) => {
          onSelect?.(date || null)
          setDate(date || null)
        }}
        selected={currentDate || undefined}
        startMonth={startMonth || new Date(1900, 6)}
      />
    </div>
  )
}
