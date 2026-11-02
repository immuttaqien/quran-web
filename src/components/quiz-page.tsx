"use client"

import useKnownWords from "@/hooks/use-known-words"
import type { QuranWord } from "@/lib/quran-api"
import WordCard from "./word-card"

interface QuizPageProps {
  words: QuranWord[]
  showTranslations: boolean
}

export default function QuizPage({ words, showTranslations }: QuizPageProps) {
  const { knownWords, toggle } = useKnownWords()

  const knownOnPage = words.filter((word) => knownWords.has(word.id)).length

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
            hidden={!showTranslations && knownWords.has(word.id)}
            isKnown={knownWords.has(word.id)}
            key={word.id}
            onToggle={() => toggle(word.id)}
            showTranslation={showTranslations}
            word={word}
          />
        ))}
      </div>
    </div>
  )
}
