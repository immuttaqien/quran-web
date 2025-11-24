import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import type { Theme } from "@/types/theme"
import PageProgress from "./_components/page-progress"
import BProgressProvider from "./_providers/bprogress-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { getWhitelabel } from "@/lib/whitelabel"
import TanstackQueryProvider from "./_providers/tanstack-query-provider"
import { ThemeProvider } from "./_providers/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: whitelabel }] = await Promise.all([getWhitelabel()])

  const name = whitelabel?.name || "SAI"

  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: `${name} - Your Gateway to Affordable Umrah Packages`,
    openGraph: {
      title: {
        default: name,
        template: `%s | ${name}`,
      },
      description: `${name} - Your Gateway to Affordable Umrah Packages`,
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-content",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [{ data: whitelabel }] = await Promise.all([getWhitelabel()])

  const theme: Theme = whitelabel?.theme || "theme-default"

  return (
    <html data-theme={theme} lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem>
          <BProgressProvider>
            <PageProgress />
            <TanstackQueryProvider>
              {children}
              <Toaster position="bottom-right" />
            </TanstackQueryProvider>
          </BProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
