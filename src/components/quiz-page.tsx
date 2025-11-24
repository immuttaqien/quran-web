"use client"

import { useEffect, useState } from "react"
import WordCard from "./word-card"
import type { QuranPage } from "@/lib/quran-data"

interface QuizPageProps {
  page: QuranPage
  showTranslations: boolean
}

export default function QuizPage({ page, showTranslations }: QuizPageProps) {
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleWordKnown = (index: number) => {
    const newKnown = new Set(knownWords)
    if (newKnown.has(index)) {
      newKnown.delete(index)
    } else {
      newKnown.add(index)
    }
    setKnownWords(newKnown)
  }

  if (!mounted) return null

  const displayWords = page.words.filter((_, index) => {
    if (showTranslations) return true
    return !knownWords.has(index)
  })

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
      <div className="flex flex-wrap flex-row-reverse gap-6 justify-center items-start">
        {page.words.map((word, index) => (
          <WordCard
            key={index}
            word={word}
            index={index}
            isKnown={knownWords.has(index)}
            onToggle={() => toggleWordKnown(index)}
            showTranslation={showTranslations}
            hidden={!showTranslations && knownWords.has(index)}
          />
        ))}
      </div>
    </div>
  )
}
