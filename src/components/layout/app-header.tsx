"use client"

import { BellIcon, CheckIcon, ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { Fragment, useId } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ThemeToggle from "../common/theme-toggle"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type Item = {
  label: string
  href?: string
  active?: boolean
  items?: Item[]
}

interface AppHeaderProps {
  breadcrumbs?: Item[]
}

export default function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const id = useId()
  const id2 = useId()

  return (
    <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="!h-4 mr-2" orientation="vertical" />
      <Breadcrumb className="flex-1 shrink-0 basis-[calc(100%-350px)]">
        <BreadcrumbList className="flex-nowrap truncate">
          {breadcrumbs.map((crumb, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: only for static breadcrumbs
            <Fragment key={`${id}-crumb-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="truncate">
                {crumb.items ? (
                  <DropdownMenu>
                    {crumb.active ? (
                      <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-4">
                        {crumb.label}
                        <ChevronDownIcon />
                      </DropdownMenuTrigger>
                    ) : (
                      <DropdownMenuTrigger className="flex items-center gap-1 hover:text-accent-foreground [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0">
                        {crumb.label}
                        <ChevronDownIcon />
                      </DropdownMenuTrigger>
                    )}
                    <DropdownMenuContent
                      align={!crumb.active ? "start" : "center"}>
                      {crumb.items.map((item, idx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: only for static breadcrumbs
                        <Fragment key={`${id2}-item-${idx}`}>
                          {item.href ? (
                            <DropdownMenuItem asChild>
                              <Link href={item.href}>
                                {item.label}
                                {item.active ? (
                                  <CheckIcon className="ml-auto" />
                                ) : null}
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>{item.label}</DropdownMenuItem>
                          )}
                        </Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : crumb.active ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  crumb.label
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-4 flex w-[300px] items-center justify-end gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <BellIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Tidak ada notifikasi baru</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
