"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import useReviewCards from "@/hooks/use-review-cards"
import { isDue } from "@/lib/srs"
import { isNavItemActive, NAV_ITEMS } from "./nav-items"

export function NavMain() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const cards = useReviewCards()

  const now = Date.now()
  const dueCount = cards.filter((card) => isDue(card, now)).length

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isNavItemActive(item, pathname)}
                tooltip={item.title}>
                {/* Tutup panel di layar kecil setelah berpindah halaman. */}
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon />
                  <span>{item.title}</span>
                  {item.href === "/review" && dueCount > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs">
                      {dueCount}
                      <span className="sr-only"> kata jatuh tempo</span>
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
