"use client"

import { useEffect, useState } from "react"
import QuizSession from "@/components/quiz-session"
import useKnownWords from "@/hooks/use-known-words"
import useReviewCards from "@/hooks/use-review-cards"
import { wordKey } from "@/lib/known-words-store"
import type { QuranWord } from "@/lib/quran-api"
import {
  getReviewSnapshot,
  parseReviews,
  recordAnswer,
  reviewCardToWord,
} from "@/lib/review-store"
import { formatWait, isDue, nextDueAt, selectDue } from "@/lib/srs"

interface Session {
  words: QuranWord[]
  pool: QuranWord[]
}

/** Sesi ulasan: kata yang jatuh tempo, paling lama menunggu lebih dulu. */
export default function ReviewMode() {
  const { markKnown } = useKnownWords()

  // Daftar kata sesi ditetapkan sekali saat mount. Jika mengikuti jadwal yang
  // terus berubah selama menjawab, sesi akan terus ter-reset.
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const cards = Object.values(parseReviews(getReviewSnapshot()))

    setSession({
      words: selectDue(cards, Date.now()).map(reviewCardToWord),
      pool: cards.map(reviewCardToWord),
    })
  }, [])

  if (session === null) return null

  return (
    <QuizSession
      allowRestart={false}
      backHref="/"
      backLabel="Daftar surah"
      emptyMessage={<ReviewStatus />}
      finishNote="Jadwal ulasan tiap kata sudah diperbarui."
      onAnswer={(word, correct) => {
        recordAnswer(word, correct)
        if (correct) markKnown(wordKey(word.verseKey, word.position))
      }}
      pool={session.pool}
      resultFooter={
        <div className="mt-6 text-sm text-slate-500">
          <ReviewStatus />
        </div>
      }
      title="Ulasan kata"
      words={session.words}
    />
  )
}

/** Ringkasan: berapa kata terjadwal, berapa yang jatuh tempo, dan kapan berikutnya. */
function ReviewStatus() {
  const cards = useReviewCards()

  if (cards.length === 0) {
    return (
      <p>
        Belum ada kata yang dijadwalkan. Tandai kata sebagai dikenal atau ikuti
        kuis di halaman surah, lalu kata akan muncul di sini untuk diulas.
      </p>
    )
  }

  const now = Date.now()
  const dueCount = cards.filter((card) => isDue(card, now)).length
  const next = nextDueAt(cards, now)

  return (
    <p>
      {cards.length} kata terjadwal
      {dueCount > 0
        ? `, ${dueCount} jatuh tempo.`
        : ", tidak ada yang jatuh tempo sekarang."}
      {next !== null && ` Ulasan berikutnya dalam ${formatWait(next - now)}.`}
    </p>
  )
}
