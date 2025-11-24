import { useEffect } from "react"

import useTimeout from "./use-timeout"

export default function useDebounce(
  callback: () => void,
  deps: React.DependencyList,
  ms: number = 1000
) {
  const { clear, reset } = useTimeout(callback, ms)
  // biome-ignore lint/correctness/useExhaustiveDependencies: we want this to run only when deps change
  useEffect(reset, [...deps, reset])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(clear, [])
}
