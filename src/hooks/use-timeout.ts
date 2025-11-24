import { useCallback, useEffect, useRef } from "react"

export default function useTimeout(callback: () => void, ms: number = 1000) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), ms)
  }, [ms])

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want this to run only when ms changes
  useEffect(() => {
    set()
    return clear
  }, [ms, set, clear])

  const reset = useCallback(() => {
    clear()
    set()
  }, [clear, set])

  return { reset, clear }
}
