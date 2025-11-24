import { useRouter } from "@bprogress/next"
import { usePathname, useSearchParams } from "next/navigation"
import qs from "qs"

import { buildQueryParams } from "@/lib/utils"

export default function useQueryParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateQueryParams(
    updater: (
      query: qs.ParsedQs,
      helpers: {
        reset: () => void
        resetExcept: (keys: string[]) => void
      }
    ) => void,
    replace = false
  ) {
    const query: qs.ParsedQs = qs.parse(searchParams.toString())

    updater(query, {
      reset: () => {
        for (const key in query) {
          query[key] = undefined
        }
      },
      resetExcept: (keys: string[]) => {
        for (const key in query) {
          if (!keys.includes(key)) {
            query[key] = undefined
          }
        }
      },
    })

    if (Object.keys(query).length === 0) {
      if (replace) {
        router.replace(pathname)
      } else {
        router.push(pathname)
      }
    } else {
      if (replace) {
        router.replace(buildQueryParams(query))
      } else {
        router.push(buildQueryParams(query))
      }
    }
  }

  return { updateQueryParams }
}
