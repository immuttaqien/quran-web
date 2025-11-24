// biome-ignore lint/style/useNodejsImportProtocol: it works
import path from "path"

import { env } from "@/data/env/client"

export function fetcher<T>(...endpoint: string[]) {
  const pathname = getPathname(...endpoint)

  return async (options?: RequestInit): Promise<T> => {
    const url = `${env.NEXT_PUBLIC_API_URL}${pathname}`

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    let data: unknown = null
    const isJson = res.headers.get("content-type")?.includes("application/json")

    if (isJson) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    if (!res.ok) {
      // throw new Error(
      //   `Error: ${JSON.stringify(await res.json().catch(() => res.statusText))}`
      // )

      const message =
        (isJson && (data as { message?: string })?.message) ||
        res.statusText ||
        "Unknown API error"

      throw new APIError(message, url, res.status, data)
    }

    if (res.status === 204) return null as T

    return data as T
  }
}

export function fetcherWithFormData<T>(...endpoint: string[]) {
  const pathname = getPathname(...endpoint)

  return async (options?: RequestInit): Promise<T> => {
    const url = `${env.NEXT_PUBLIC_API_URL}${pathname}`

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
      },
    })

    let data: unknown = null
    const isJson = res.headers.get("content-type")?.includes("application/json")

    if (isJson) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    if (!res.ok) {
      // throw new Error(
      //   `Error: ${JSON.stringify(await res.json().catch(() => res.statusText))}`
      // )

      const message =
        (isJson && (data as { message?: string })?.message) ||
        res.statusText ||
        "Unknown API error"

      throw new APIError(message, url, res.status, data)
    }

    if (res.status === 204) return null as T

    return data as T
  }
}

export class APIError extends Error {
  status: number
  url: string
  info?: unknown

  constructor(message: string, url: string, status: number, info?: unknown) {
    super(message)
    this.name = "APIError"
    this.url = url
    this.status = status
    this.info = info
  }
}

function getPathname(...endpoint: string[]) {
  const lastEndpoint = endpoint[endpoint.length - 1]
  const hasQueryParams = lastEndpoint.startsWith("?")
  const endsWithSlash = lastEndpoint.startsWith("/")

  const pathname =
    path.join(...endpoint.slice(0, -1)) +
    (hasQueryParams || endsWithSlash ? "" : "/") +
    lastEndpoint

  return pathname.replace(/^\.\/+/, "/").replace(/\/$/, "")
}
