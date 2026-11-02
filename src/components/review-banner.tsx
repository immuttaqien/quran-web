"use client"

import Link from "next/link"
import useReviewCards from "@/hooks/use-review-cards"
import { isDue } from "@/lib/srs"

/** Ajakan mengulas di beranda; tidak tampil sebelum ada kata terjadwal. */
export default function ReviewBanner() {
  const cards = useReviewCards()

  if (cards.length === 0) return null

  const now = Date.now()
  const dueCount = cards.filter((card) => isDue(card, now)).length

  return (
    <Link
      className="mb-6 flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 p-4 transition-colors hover:bg-teal-100"
      href="/review">
      <span className="font-medium text-teal-900">
        {dueCount > 0
          ? `${dueCount} kata jatuh tempo untuk diulas`
          : "Tidak ada kata jatuh tempo sekarang"}
      </span>
      <span className="text-sm text-teal-700">Buka ulasan →</span>
    </Link>
  )
}
