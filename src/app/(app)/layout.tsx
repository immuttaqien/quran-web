import { cookies } from "next/headers"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import constant from "@/data/constant"
import cookie from "@/data/cookie"
import { parseIntOrDefault } from "@/lib/utils"
import { getWhitelabel } from "@/lib/whitelabel"
import AppProvider from "./_providers/app-provider"

export default async function Layout({ children }: React.PropsWithChildren) {
  const cookieStore = await cookies()

  const { data: whitelabel } = await getWhitelabel()

  const pageSize = cookieStore.get(
    cookie.PAGE_SIZE(
      whitelabel?.name.split(" ").join("_").toLowerCase() || constant.PREFIX
    )
  )

  return (
    <AppProvider configs={{ pageSize: parseIntOrDefault(pageSize?.value, 10) }}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }>
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          {/* className="h-dvh overflow-hidden" */}

          {children}
        </SidebarInset>
      </SidebarProvider>
    </AppProvider>
  )
}
