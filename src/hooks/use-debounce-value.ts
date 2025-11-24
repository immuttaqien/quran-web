import { useState } from "react"

import useDebounce from "./use-debounce"

export default function useDebounceValue<T>(value: T, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useDebounce(
    () => {
      setDebouncedValue(value)
    },
    [value],
    ms
  )

  return debouncedValue
}
