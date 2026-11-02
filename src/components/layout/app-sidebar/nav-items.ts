import {
  BookOpenIcon,
  DatabaseIcon,
  type LucideIcon,
  RepeatIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  /** Rute lain yang dianggap bagian dari item ini (selain `href` sendiri). */
  alsoActiveOn?: string[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Daftar Surah",
    href: "/",
    icon: BookOpenIcon,
    alsoActiveOn: ["/surah"],
  },
  { title: "Ulasan", href: "/review", icon: RepeatIcon },
  { title: "Data progres", href: "/progress", icon: DatabaseIcon },
]

/** `pathname` sama dengan `base` atau berada di bawahnya (per segmen, bukan awalan teks). */
function isUnder(pathname: string, base: string): boolean {
  if (base === "/") return pathname === "/"

  return pathname === base || pathname.startsWith(`${base}/`)
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return [item.href, ...(item.alsoActiveOn ?? [])].some((base) =>
    isUnder(pathname, base)
  )
}
