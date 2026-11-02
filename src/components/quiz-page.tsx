"use client"

import useKnownWords from "@/hooks/use-known-words"
import { wordKey } from "@/lib/known-words-store"
import type { QuranWord } from "@/lib/quran-api"
import WordCard from "./word-card"

interface QuizPageProps {
  words: QuranWord[]
  showTranslations: boolean
}

export default function QuizPage({ words, showTranslations }: QuizPageProps) {
  const { knownWords, toggle } = useKnownWords()

  const keyOf = (word: QuranWord) => wordKey(word.verseKey, word.position)
  const knownOnPage = words.filter((word) => knownWords.has(keyOf(word))).length

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
      <p className="text-sm text-slate-500 mb-6">
        {knownOnPage} dari {words.length} kata di halaman ini sudah dikenal
      </p>
      <div
        className="flex flex-wrap gap-6 justify-center items-start"
        dir="rtl">
        {words.map((word) => (
          <WordCard
            hidden={!showTranslations && knownWords.has(keyOf(word))}
            isKnown={knownWords.has(keyOf(word))}
            key={word.id}
            onToggle={() => toggle(keyOf(word))}
            showTranslation={showTranslations}
            word={word}
          />
        ))}
      </div>
    </div>
  )
}
