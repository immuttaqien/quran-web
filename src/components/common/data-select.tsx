"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderIcon,
  SquareXIcon,
} from "lucide-react"
import { createContext, useContext, useEffect, useId, useState } from "react"
import { useInView } from "react-intersection-observer"
import useDebounceValue from "@/hooks/use-debounce-value"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface DataSelectProps<T> {
  id?: string
  ref?: React.Ref<HTMLButtonElement> | undefined
  value?: T | null
  defaultValue?: T
  onChange?: (value: T | null) => void
  disabled?: boolean
  disabledItems?: (value: T) => boolean
  className?: string
  loadItems: (props: {
    start?: number
    limit?: number
    keyword?: string
  }) => Promise<{ data: T[] }>
  options?: Record<string, unknown>
  limit?: number
  renderItem: (value: T) => React.ReactNode
  renderSelected?: (value: T) => React.ReactNode
  getOptionValue: (item: T) => string
  placeholder?: string
  noDataLabel?: string
  emptySearchLabel?: (search: string) => string
  errorLabel?: string
  allowClear?: boolean
  enableSearch?: boolean
  group?: boolean
  "aria-invalid"?: boolean
}

const DataSelectContext = createContext<
  Pick<
    DataSelectProps<unknown>,
    | "value"
    | "onChange"
    | "disabledItems"
    | "className"
    | "loadItems"
    // | "options"
    // | "limit"
    | "renderItem"
    | "getOptionValue"
    // | "noDataLabel"
    // | "emptySearchLabel"
    // | "errorLabel"
    // | "allowClear"
    // | "enableSearch"
  > &
    Required<
      Pick<
        DataSelectProps<unknown>,
        // | "value"
        // | "onChange"
        // | "disabledItems"
        // | "loadItems"
        | "options"
        | "limit"
        // | "renderItem"
        // | "getOptionValue"
        | "noDataLabel"
        | "emptySearchLabel"
        | "errorLabel"
        | "allowClear"
        | "enableSearch"
      >
    > & {
      isControlled: boolean
      setInternalValue: (value: unknown) => void
      setOpen: (open: boolean) => void
    }
>(null!)

export default function DataSelect<T>({
  id,
  ref,
  value: propValue,
  defaultValue,
  onChange,
  disabled,
  disabledItems,
  className,
  loadItems,
  options = {},
  limit = 20,
  renderItem,
  renderSelected = renderItem,
  getOptionValue,
  placeholder = "Pilih data",
  noDataLabel = "Tidak ada data tersedia.",
  emptySearchLabel = (search) => `Tidak ada data dengan kata kunci "${search}"`,
  errorLabel = "Gagal memuat data.",
  allowClear = true,
  enableSearch = true,
  group = false,
  "aria-invalid": ariaInvalid,
}: DataSelectProps<T>) {
  const isControlled = propValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? propValue : internalValue

  const [open, setOpen] = useState(false)

  return (
    <DataSelectContext.Provider
      value={{
        value,
        onChange: onChange as (value: unknown) => void,
        disabledItems: disabledItems as (value: unknown) => boolean,
        className,
        loadItems,
        options,
        limit,
        renderItem: (value) => renderItem(value as T),
        getOptionValue: (item) => getOptionValue(item as T),
        noDataLabel,
        emptySearchLabel,
        errorLabel,
        allowClear,
        enableSearch,

        isControlled,
        setInternalValue: (value) => setInternalValue(value as T),
        setOpen,
      }}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-between border-input bg-transparent px-3 font-normal outline-none outline-offset-0 hover:bg-transparent hover:text-inherit focus-visible:outline-[3px] data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
              // !value && "not-aria-[invalid]:[&_>_span]:text-muted-foreground",
              // "not-aria-[invalid]:[&_svg]:text-muted-foreground/80",
              group &&
                "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0",
              className
            )}
            data-placeholder={!value || undefined}
            data-slot={group ? "button-group-control" : undefined}
            disabled={disabled}
            id={id}
            ref={ref}
            role="combobox"
            variant="outline">
            <span className={cn("truncate")} data-slot="select-value">
              {value ? renderSelected(value) : placeholder}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="shrink-0 opacity-50"
              size={16}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popper-anchor-width)] border-input p-0"
          onWheel={(e) => e.stopPropagation()}>
          <DataSelectContent />
        </PopoverContent>
      </Popover>
    </DataSelectContext.Provider>
  )
}

function DataSelectContent<T>() {
  const ctx = useContext(DataSelectContext)
  if (!ctx) {
    throw new Error("DataSelectContent must be used within a DataSelect")
  }

  const {
    value,
    onChange,
    disabledItems,
    className,
    loadItems,
    options,
    limit,
    renderItem,
    getOptionValue,
    noDataLabel,
    emptySearchLabel,
    errorLabel,
    allowClear,
    enableSearch,

    isControlled,
    setInternalValue,
    setOpen,
  } = ctx

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounceValue(search, 300)
  const [loadingRef, inView] = useInView()

  const queryKey = useId()

  const effectiveKeyword = enableSearch ? debouncedSearch : undefined

  const {
    data,
    status,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      queryKey,
      {
        ...(enableSearch ? { keyword: effectiveKeyword } : {}),
        ...options,
      },
    ],
    queryFn: (props) =>
      loadItems({
        start: props.pageParam,
        limit,
        keyword: effectiveKeyword,
        ...options,
      }),
    initialPageParam: 0,
    initialData: {
      pages: [],
      pageParams: [],
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length >= limit) {
        return allPages.length * limit
      }
      return undefined
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want this to run when inView changes
  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView])

  function handleSelect(selected: T) {
    if (!isControlled) setInternalValue(selected)
    if (selected !== value) {
      onChange?.(selected)
    }
    setOpen(false)
  }

  function handleClear() {
    if (!isControlled) setInternalValue(undefined)
    if (value != null) {
      onChange?.(null)
    }
    setOpen(false)
  }

  return (
    <Command shouldFilter={false}>
      {enableSearch ? (
        <CommandInput
          aria-label={"Search"}
          onValueChange={setSearch}
          value={search}
        />
      ) : null}
      <CommandList>
        {isFetching && data.pages.length <= 0 ? (
          <div className="flex justify-center py-6">
            <LoaderIcon
              aria-label="Loading"
              className={cn(
                "size-4 animate-spin text-muted-foreground",
                className
              )}
              role="status"
            />
          </div>
        ) : (
          <CommandEmpty>
            {status === "error" ? (
              <div className="flex flex-col items-center gap-2">
                <AlertTriangleIcon className="text-destructive" />
                <div className="text-destructive">{errorLabel}</div>
              </div>
            ) : effectiveKeyword ? (
              emptySearchLabel(effectiveKeyword)
            ) : (
              noDataLabel
            )}
          </CommandEmpty>
        )}

        {status === "success" && data.pages.length > 0 ? (
          <CommandGroup>
            {data.pages.map((page) =>
              page.data.map((data) => (
                <CommandItem
                  disabled={disabledItems ? disabledItems(data) : false}
                  key={getOptionValue(data)}
                  onSelect={() => void handleSelect(data as T)}
                  value={getOptionValue(data)}>
                  {renderItem(data)}
                  {value && getOptionValue(value) === getOptionValue(data) ? (
                    <CheckIcon className="ml-auto" size={16} />
                  ) : null}
                </CommandItem>
              ))
            )}

            {hasNextPage ? (
              <div
                className="flex justify-center py-6"
                ref={!isFetchingNextPage ? loadingRef : null}>
                <LoaderIcon
                  aria-label="Loading"
                  className={cn(
                    "size-4 animate-spin text-muted-foreground",
                    className
                  )}
                  role="status"
                />
              </div>
            ) : null}
          </CommandGroup>
        ) : null}
      </CommandList>

      {allowClear ? (
        <>
          <CommandSeparator />
          <CommandGroup
            className={cn((effectiveKeyword?.length || 0) > 0 && "hidden")}>
            <Button
              className="w-full justify-start font-normal"
              onClick={handleClear}
              variant="ghost">
              <SquareXIcon
                aria-hidden="true"
                className="-ms-2 opacity-60"
                size={16}
              />
              Kosongkan
            </Button>
          </CommandGroup>
        </>
      ) : null}
    </Command>
  )
}
