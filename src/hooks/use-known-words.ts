"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  clearKnownWords,
  getServerSnapshot,
  getSnapshot,
  parseKnownIds,
  subscribe,
  toggleKnownWord,
} from "@/lib/known-words-store"

export default function useKnownWords() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const knownWords = useMemo(() => new Set(parseKnownIds(raw)), [raw])

  return { knownWords, toggle: toggleKnownWord, clear: clearKnownWords }
}
