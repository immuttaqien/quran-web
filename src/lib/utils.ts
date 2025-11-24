import { type ClassValue, clsx } from "clsx"
import type { SearchParams } from "next/dist/server/request/search-params"
import qs from "qs"
import { twMerge } from "tailwind-merge"
import type { z } from "zod/v4"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null): string {
  if (!name) return "?"

  const nameParts = name.trim().split(" ")
  const initials = nameParts.map((part) => part[0].toUpperCase()).join("")

  return initials.slice(0, 2)
}

export function buildQueryParams(params: object) {
  return qs.stringify(params, {
    skipNulls: true,
    encode: true,
    addQueryPrefix: true,
    arrayFormat: "repeat",
  })
}

export function buildFormData(json: object) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(json)) {
    if (value === null || value === undefined) continue

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && item !== undefined) {
          if (item instanceof File) {
            formData.append(key, item)
          } else if (item instanceof Date) {
            formData.append(key, item.toISOString())
          } else if (typeof item === "object") {
            Object.entries(item).forEach(([k, v]) => {
              if (v != null) {
                formData.append(`${key}[${i}][${k}]`, String(v))
              }
            })
          } else {
            formData.append(`${key}[]`, String(item))
          }
        }
      })
    } else if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }
  return formData
}

export function formatPrice(
  price: number,
  options?: { locale?: string } & Intl.NumberFormatOptions
): string {
  const { locale = "id-ID", currency = "IDR", ...opts } = options || {}

  const normalized = Object.is(price, -0) ? 0 : price

  const isNegative = normalized < 0

  let formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    ...opts,
  }).format(Math.abs(normalized))

  formatted = formatted.replace(/^Rp\s?/, "Rp ")

  if (isNegative) {
    formatted = `${formatted.replace("Rp ", "Rp (")})`
  }

  return formatted
}

export function getSearchParam(
  searchParams: SearchParams,
  key: string
): string | undefined {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

export function getSearchParamAll(
  searchParams: SearchParams,
  key: string
): string[] {
  const value = searchParams[key]
  return Array.isArray(value) ? value : value ? [value] : []
}

export function parseWithDefault<T extends string>(
  schema: z.ZodEnum<Record<T, T>>,
  raw: unknown,
  fallback: T
): T

export function parseWithDefault<T extends string>(
  schema: z.ZodEnum<Record<T, T>>,
  raw: unknown
): T | undefined

export function parseWithDefault<T extends string>(
  schema: z.ZodEnum<Record<T, T>>,
  raw: unknown,
  fallback?: T
): T | undefined {
  const parsed = schema.safeParse(raw)
  return parsed.success ? parsed.data : fallback || undefined
}

export function updateGoogleImageSize(url: string, newSize: number): string {
  if (/=s\d+-c$/.test(url)) {
    return url.replace(/=s\d+-c$/, `=s${newSize}-c`)
  }

  return `${url}=s${newSize}-c`
}

export function toSnakeCase(value: string): string {
  if (!value) return ""

  const prepared = value
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")

  return prepared
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
}

export function toKebabCase(value: string): string {
  if (!value) return ""

  const prepared = value
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")

  return prepared
    .replace(/[^\w]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export async function wait(ms = 5000) {
  await new Promise((r) => setTimeout(r, ms))
}

export function slugify(str: string): string {
  return str
    .normalize("NFD") // handle unicode (e.g. é → e)
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/[^\w-]+/g, "") // remove all non-word chars
    .replace(/--+/g, "-") // collapse multiple -
    .replace(/^-+/, "") // trim - from start
    .replace(/-+$/, "") // trim - from end
}

export function getIsUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getIsSameOriginUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.origin === window.location.origin
  } catch {
    return false
  }
}

export function redirectWithAnchor(url: string) {
  const a = document.createElement("a")
  a.href = url
  a.target = "_blank" // atau '_blank' jika mau buka tab baru
  a.rel = "noopener noreferrer" // opsional, untuk keamanan
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function getDomainFromHost(host: string): string {
  if (!host) return ""

  const cleanHost = host.split(":")[0]
  const parts = cleanHost.split(".")

  if (cleanHost === "localhost") return cleanHost

  if (parts.length <= 2) return cleanHost

  const doubleTLDs = ["co.id", "com.au", "co.uk", "org.uk", "ac.id", "com.br"]
  const lastTwo = parts.slice(-2).join(".")
  const lastThree = parts.slice(-3).join(".")

  if (doubleTLDs.some((tld) => lastTwo.endsWith(tld))) {
    return lastThree
  }

  return lastTwo
}

export function parseIntOrDefault(n: string | undefined, def: number): number {
  if (!n) return def
  const parsed = parseInt(n, 10)
  if (Number.isNaN(parsed)) return def
  return parsed
}
