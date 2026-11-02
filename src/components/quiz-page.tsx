"use client"

import { useState } from "react"
import type { QuranWord } from "@/lib/quran-api"
import WordCard from "./word-card"

interface QuizPageProps {
  words: QuranWord[]
  showTranslations: boolean
}

export default function QuizPage({ words, showTranslations }: QuizPageProps) {
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set())

  const toggleWordKnown = (id: number) => {
    setKnownWords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
      <div
        className="flex flex-wrap gap-6 justify-center items-start"
        dir="rtl">
        {words.map((word) => (
          <WordCard
            hidden={!showTranslations && knownWords.has(word.id)}
            isKnown={knownWords.has(word.id)}
            key={word.id}
            onToggle={() => toggleWordKnown(word.id)}
            showTranslation={showTranslations}
            word={word}
          />
        ))}
      </div>
    </div>
  )
}
