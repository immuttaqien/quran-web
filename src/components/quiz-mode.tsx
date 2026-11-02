"use client"

import QuizSession from "@/components/quiz-session"
import useKnownWords from "@/hooks/use-known-words"
import { wordKey } from "@/lib/known-words-store"
import type { Chapter, QuranWord } from "@/lib/quran-api"
import { recordAnswer } from "@/lib/review-store"

interface QuizModeProps {
  chapter: Chapter
  page: number
  words: QuranWord[]
}

/** Kuis untuk satu halaman surah; jawaban dicatat ke jadwal ulasan. */
export default function QuizMode({ chapter, page, words }: QuizModeProps) {
  const { markKnown } = useKnownWords()

  return (
    <QuizSession
      backHref={`/surah/${chapter.id}?page=${page}`}
      backLabel="Kembali membaca"
      emptyMessage="Halaman ini belum punya cukup kata untuk dijadikan kuis."
      finishNote="Kata yang dijawab benar otomatis ditandai dikenal dan dijadwalkan untuk diulas."
      onAnswer={(word, correct) => {
        recordAnswer(word, correct)
        if (correct) markKnown(wordKey(word.verseKey, word.position))
      }}
      title={`Kuis: ${chapter.nameSimple}`}
      words={words}
    />
  )
}
