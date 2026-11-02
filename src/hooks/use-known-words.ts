"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  clearKnownWords,
  countByChapter,
  getServerSnapshot,
  getSnapshot,
  markKnownWord,
  parseKnownKeys,
  subscribe,
  toggleKnownWord,
} from "@/lib/known-words-store"

export default function useKnownWords() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const knownWords = useMemo(() => new Set(parseKnownKeys(raw)), [raw])
  const countsByChapter = useMemo(
    () => countByChapter(knownWords),
    [knownWords]
  )

  return {
    knownWords,
    countsByChapter,
    toggle: toggleKnownWord,
    markKnown: markKnownWord,
    clear: clearKnownWords,
  }
}
