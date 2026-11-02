"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  getReviewServerSnapshot,
  getReviewSnapshot,
  parseReviews,
  subscribeReviews,
} from "@/lib/review-store"

/** Semua kartu ulasan yang tersimpan. */
export default function useReviewCards() {
  const raw = useSyncExternalStore(
    subscribeReviews,
    getReviewSnapshot,
    getReviewServerSnapshot
  )

  return useMemo(() => Object.values(parseReviews(raw)), [raw])
}
