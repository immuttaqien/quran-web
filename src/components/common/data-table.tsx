"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2Icon,
  type LucideProps,
  MoreVerticalIcon,
  XIcon,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import React, {
  type Context,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useId,
  useState,
} from "react"

import { setPageSize } from "@/actions"
import { useAppContext } from "@/app/(app)/_providers/app-provider"
import useQueryParams from "@/hooks/use-query-params"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  type CommonDialogContextProps,
  useCommonDialogContext,
} from "./common-dialog"
import LoadingIcon from "./loading-icon"

type TDataType = Record<
  string,
  string | number | boolean | object | null | unknown
>

export type DataTableColumn<TData extends TDataType> = {
  key: (keyof TData & string) | (string & {})
  label: React.ReactNode
  render?: (data: TData) => React.ReactNode
  // className?: string
}

interface DataTableProps extends React.PropsWithChildren {
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return <div className={cn("max-w-full space-y-4", className)}>{children}</div>
}

export type DataTableRowActionsComponent =
  React.ComponentType<React.PropsWithChildren>

export type DataTableRowActionsContent =
  | React.ReactNode
  | ((Actions: DataTableRowActionsComponent) => React.ReactNode)

type DataTableRowActionsRenderer<TData extends TDataType> = (
  row: TData
) => DataTableRowActionsContent

export type DataTableFooterCell = {
  start?: number
  colSpan?: number
  content?: React.ReactNode
}

interface DataTableViewProps<TData extends TDataType> {
  getItemKey?: (item: TData, idx: number) => string
  columns?: DataTableColumn<TData>[]
  data?: TData[]
  rowActions?: DataTableRowActionsRenderer<TData>
  className?: string
  rowActionsProps?: {
    align?: "start" | "center" | "end"
    className?: string
  }
  footer?: DataTableFooterCell[]
  onRowCheckedChange?: (checked: boolean, item: TData) => void
  getRowChecked?: (item: TData) => boolean
  getRowDisabled?: (item: TData) => boolean
}

export function DataTableView<TData extends TDataType>({
  getItemKey = (_item, i) => `row-${i}`,
  columns = [],
  data = [],
  rowActions,
  className,
  rowActionsProps = {},
  footer = [],
  onRowCheckedChange,
  getRowChecked,
  getRowDisabled,
}: DataTableViewProps<TData>) {
  const rowId = useId()

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table className="h-full">
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            {onRowCheckedChange ? (
              <TableHead>
                <span className="sr-only">Checkbox</span>
              </TableHead>
            ) : null}
            {columns.map((column) => (
              <TableHead
                className={cn(columns.length <= 1 && "w-full")}
                key={column.key}>
                {column.label}
              </TableHead>
            ))}
            {rowActions ? (
              <TableHead className="w-[48px] min-w-[48px]">
                <span className="sr-only">Aksi</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody className="h-full **:data-[slot=table-cell]:first:w-8">
          {data.length > 0 ? (
            data.map((item, i) => (
              <TableRow
                className="h-full"
                key={`${rowId}-${getItemKey(item, i)}`}>
                {onRowCheckedChange ? (
                  <TableCell>
                    <Checkbox
                      checked={getRowChecked ? getRowChecked(item) : false}
                      disabled={getRowDisabled ? getRowDisabled(item) : false}
                      id={`checkbox-${rowId}-${getItemKey(item, i)}`}
                      onCheckedChange={(checked) => {
                        onRowCheckedChange(!!checked, item)
                      }}
                    />
                  </TableCell>
                ) : null}
                {columns.map((column) => {
                  const itemKey = column.key
                  const itemValue = column.render?.(item) ?? item[itemKey]

                  return (
                    <TableCell
                      key={itemKey}
                      // className={cn(column.className)}
                    >
                      {itemValue != null &&
                      (typeof itemValue === "string" ||
                        typeof itemValue === "number" ||
                        isValidElement(itemValue)) ? (
                        itemValue
                      ) : (
                        <span className="text-muted-foreground/80">-</span>
                      )}
                    </TableCell>
                  )
                })}

                {rowActions?.(item) ? (
                  <TableCell
                    className="sticky right-0 flex h-full items-center justify-center border-l bg-muted"
                    key="__actions">
                    <DataTableRowActions {...rowActionsProps}>
                      {rowActions(item)}
                    </DataTableRowActions>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-128 text-center"
                colSpan={columns.length + 2}>
                Data tidak ditemukan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer.length > 0 ? (
          <TableFooter>
            <TableRow>
              {(() => {
                const totalColumns = columns.length + (rowActions ? 1 : 0)
                const cells: React.ReactNode[] = []
                let currentCol = 1
                let lastEndCol = 0

                footer.forEach((cell, i) => {
                  const colSpan = Math.max(1, cell.colSpan ?? 1)
                  let start: number

                  if (cell.start != null) {
                    start = cell.start
                  } else {
                    start = lastEndCol + 1
                  }

                  const endCol = start + colSpan - 1

                  if (
                    start < 1 ||
                    start > totalColumns ||
                    endCol > totalColumns ||
                    start <= lastEndCol
                  ) {
                    return
                  }

                  while (currentCol < start) {
                    cells.push(
                      <TableCell key={`${rowId}-empty-${currentCol}`} />
                    )
                    currentCol++
                  }

                  cells.push(
                    // biome-ignore lint/suspicious/noArrayIndexKey: only for static footer
                    <TableCell colSpan={colSpan} key={`${rowId}-footer-${i}`}>
                      {cell.content ?? null}
                    </TableCell>
                  )

                  currentCol += colSpan
                  lastEndCol = endCol
                })

                while (currentCol <= totalColumns) {
                  cells.push(<TableCell key={`empty-${currentCol}`} />)
                  currentCol++
                }

                return cells
              })()}
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  )
}

const DataTableToolbarActionContext = createContext<{
  mode: "button" | "dropdown"
  onClose: () => void
}>({
  mode: "button",
  onClose: () => {},
})

function DataTableToolbarActionProvider({
  mode,
  onClose,
  children,
}: React.PropsWithChildren<{
  mode: "button" | "dropdown"
  onClose: () => void
}>) {
  return (
    <DataTableToolbarActionContext.Provider value={{ mode, onClose }}>
      {children}
    </DataTableToolbarActionContext.Provider>
  )
}

interface DataTableToolbarProps {
  className?: string
  children?: DataTableRowActionsContent
}

export function DataTableToolbar({
  className,
  children,
}: DataTableToolbarProps) {
  const [open, setOpen] = useState(false)

  const searchParams = useSearchParams()
  const { updateQueryParams } = useQueryParams()

  const q = searchParams.get("q")

  const Content = ({ children }: React.PropsWithChildren) => (
    <>
      <div className="hidden flex-row gap-2 lg:flex">
        <DataTableToolbarActionProvider
          mode="button"
          onClose={() => void setOpen(false)}>
          {children}
        </DataTableToolbarActionProvider>
      </div>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button className="size-8 lg:hidden" size="icon" variant="outline">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="lg:hidden">
          <DataTableToolbarActionProvider
            mode="dropdown"
            onClose={() => void setOpen(false)}>
            {children}
          </DataTableToolbarActionProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <form
        action={(formData) => {
          updateQueryParams((query) => {
            const q = formData.get("q")
            if (typeof q === "string") {
              if (q) query.q = q
              else delete query.q
            } else {
              delete query.q
            }
            delete query.page
          })
        }}
        className="flex flex-1 flex-row gap-2">
        <Input
          autoComplete="on"
          autoSave="on"
          className="h-8 w-full max-w-xs"
          defaultValue={q || undefined}
          id="q"
          name="q"
          placeholder="Pencarian..."
        />
        {q ? (
          <Button
            className="h-8 px-2 lg:px-3"
            onClick={() => {
              updateQueryParams((query) => {
                delete query.q
              })
            }}
            // onClick={() => table.resetColumnFilters()}
            type="button"
            variant="ghost">
            Reset
            <XIcon />
          </Button>
        ) : null}
      </form>

      {children ? (
        typeof children === "function" ? (
          children(Content)
        ) : (
          <>
            <div className="hidden flex-row gap-2 lg:flex">
              <DataTableToolbarActionProvider
                mode="button"
                onClose={() => void setOpen(false)}>
                {children}
              </DataTableToolbarActionProvider>
            </div>
            <DropdownMenu onOpenChange={setOpen} open={open}>
              <DropdownMenuTrigger asChild>
                <Button
                  className="size-8 lg:hidden"
                  size="icon"
                  variant="outline">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="lg:hidden">
                <DataTableToolbarActionProvider
                  mode="dropdown"
                  onClose={() => void setOpen(false)}>
                  {children}
                </DataTableToolbarActionProvider>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )
      ) : null}
    </div>
  )
}

interface DataTableToolbarActionProps {
  variant?: "default" | "outline"
  icon?: React.ReactElement<LucideProps>
  asChild?: boolean
  className?: string
  disabled?: boolean
  loading?: boolean
  onClick?: (args: { onClose: () => void }) => void
  manualClose?: boolean
  items?: React.ReactElement<DataTableToolbarActionProps>[]
  mode?: "button" | "dropdown"
  inset?: boolean
}

export function DataTableToolbarAction({
  variant,
  icon,
  asChild,
  className,
  disabled,
  loading,
  onClick,
  manualClose,
  items = [],
  mode: propsMode,
  inset,
  children,
}: React.PropsWithChildren<DataTableToolbarActionProps>) {
  const id = useId()
  const { mode, onClose } = useContext(DataTableToolbarActionContext)
  const finalMode = propsMode || mode

  if (finalMode === "dropdown") {
    if (items.length > 0) {
      return (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            asChild={asChild}
            disabled={disabled || loading}
            inset={inset}>
            {children}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: only for static items
                <React.Fragment key={`${id}-dds-${index}`}>
                  {item}
                </React.Fragment>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )
    }

    return (
      <DropdownMenuItem
        asChild={asChild}
        disabled={disabled || loading}
        onClick={(e) => {
          if (manualClose) {
            e.preventDefault()
          }
          onClick?.({ onClose })
        }}>
        {asChild ? (
          children
        ) : (
          <>
            <LoadingIcon loading={loading}>{icon}</LoadingIcon>
            {children}
          </>
        )}
      </DropdownMenuItem>
    )
  }

  if (items.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            asChild={asChild}
            className={cn("h-8", className)}
            disabled={disabled || loading}
            variant={variant}>
            {asChild ? (
              children
            ) : (
              <>
                {loading ? <Loader2Icon className="animate-spin" /> : icon}
                {children}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: only for static items
            <React.Fragment key={`${id}-ddm-${index}`}>{item}</React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      asChild={asChild}
      className={cn("h-8", className)}
      disabled={disabled || loading}
      onClick={() => {
        onClick?.({ onClose })
      }}
      variant={variant}>
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2Icon className="animate-spin" /> : icon}
          {children}
        </>
      )}
    </Button>
  )
}

const DataTableRowActionContext = createContext<{
  onClose: () => void
}>({
  onClose: () => {},
})

function DataTableRowActionProvider({
  onClose,
  children,
}: React.PropsWithChildren<{ onClose: () => void }>) {
  return (
    <DataTableRowActionContext.Provider value={{ onClose }}>
      {children}
    </DataTableRowActionContext.Provider>
  )
}

interface DataTableRowActionsProps {
  className?: string
  align?: "start" | "center" | "end"
  children?: DataTableRowActionsContent
}

function DataTableRowActions({
  className,
  align = "end",
  children,
}: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false)

  const Content = ({ children }: React.PropsWithChildren) => (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button className="size-8" size="icon" variant="ghost">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        <DataTableRowActionProvider onClose={() => void setOpen(false)}>
          {children}
        </DataTableRowActionProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (typeof children === "function") {
    return <>{children(Content)}</>
  }

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button className="size-8" size="icon" variant="ghost">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        <DataTableRowActionProvider onClose={() => void setOpen(false)}>
          {children}
        </DataTableRowActionProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface DataTableRowActionProps {
  variant?: "default" | "destructive"
  icon?: React.ReactElement<LucideProps>
  asChild?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: (args: { onClose: () => void }) => void
  manualClose?: boolean
}

export function DataTableRowAction({
  variant,
  icon,
  asChild,
  disabled,
  loading,
  onClick,
  manualClose = false,
  children,
}: React.PropsWithChildren<DataTableRowActionProps>) {
  const { onClose } = useContext(DataTableRowActionContext)

  return (
    <DropdownMenuItem
      asChild={asChild}
      disabled={disabled || loading}
      onClick={(e) => {
        if (manualClose) e.preventDefault()
        onClick?.({ onClose })
      }}
      variant={variant}>
      {asChild ? (
        children
      ) : (
        <>
          <LoadingIcon loading={loading}>{icon}</LoadingIcon>
          {children}
        </>
      )}
    </DropdownMenuItem>
  )
}

export const DataTableRowActionSeparator = DropdownMenuSeparator

interface DataTableFooterProps {
  totalItems?: number
}

export function DataTableFooter({ totalItems }: DataTableFooterProps) {
  const rowsPerPageId = useId()

  const searchParams = useSearchParams()
  const { updateQueryParams } = useQueryParams()

  const { pageSize: size } = useAppContext()
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page") || "1", 10)
    : 1
  const totalPages = totalItems ? Math.ceil(totalItems / size) : 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Label className="max-sm:sr-only" htmlFor={rowsPerPageId}>
          Baris per halaman
        </Label>
        <Select
          onValueChange={async (value) => {
            updateQueryParams((query) => {
              query.size = value
            })
            await setPageSize(+value)
          }}
          value={`${size}`}>
          <SelectTrigger
            className="h-8 w-fit whitespace-nowrap"
            id={rowsPerPageId}>
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
            {[5, 10, 25, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          {totalItems ? Math.min((currentPage - 1) * size + 1, totalItems) : 0}-
          {totalItems ? Math.min(currentPage * size, totalItems) : 0} dari{" "}
          {totalItems ?? 0}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={currentPage <= 1}
            onClick={() => {
              updateQueryParams((query) => {
                query.page = "1"
              })
            }}
            variant="outline">
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={currentPage <= 1}
            onClick={() => {
              updateQueryParams((query) => {
                query.page = `${currentPage - 1}`
              })
            }}
            variant="outline">
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            disabled={currentPage >= totalPages}
            onClick={() => {
              updateQueryParams((query) => {
                query.page = `${currentPage + 1}`
              })
            }}
            variant="outline">
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={currentPage >= totalPages}
            onClick={() => {
              updateQueryParams((query) => {
                query.page = `${totalPages}`
              })
            }}
            variant="outline">
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

type DataTableActionTriggerProps = {
  icon?: React.ReactElement<LucideProps>
  type: "toolbar" | "row"
  Context: Context<CommonDialogContextProps>
  variant?: "default" | "outline" | "destructive"
}

export function DataTableActionTrigger({
  icon,
  type,
  Context,
  variant,
  children,
}: React.PropsWithChildren<DataTableActionTriggerProps>) {
  const { setOpen } = useCommonDialogContext(Context)

  if (type === "toolbar") {
    return (
      <DataTableToolbarAction
        icon={icon}
        onClick={() => setOpen(true)}
        variant={variant === "destructive" ? "default" : variant}>
        {children}
      </DataTableToolbarAction>
    )
  }

  if (type === "row") {
    return (
      <DataTableRowAction
        icon={icon}
        onClick={() => setOpen(true)}
        variant={variant === "outline" ? "default" : variant}>
        {children}
      </DataTableRowAction>
    )
  }

  return <Fragment>{children}</Fragment>
}
