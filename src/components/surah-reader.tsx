"use client"

import Link from "next/link"
import { useState } from "react"
import QuizPage from "@/components/quiz-page"
import SurahStats from "@/components/surah-stats"
import type { ChapterPage } from "@/lib/quran-api"

interface SurahReaderProps extends ChapterPage {
  totalWords: number | null
}

export default function SurahReader({
  chapter,
  words,
  pagination,
  totalWords,
}: SurahReaderProps) {
  const [showTranslations, setShowTranslations] = useState(false)
  const { currentPage, totalPages } = pagination

  const href = (page: number) => `/surah/${chapter.id}?page=${page}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link className="text-sm text-teal-600 hover:underline" href="/">
                ← Daftar Surah
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 font-sans">
                {chapter.nameSimple} ({chapter.id})
              </h1>
              <p className="text-slate-500 text-sm">
                {chapter.nameTranslated} · {chapter.versesCount} ayat · Halaman{" "}
                {currentPage} dari {totalPages}
              </p>
            </div>

            <button
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                showTranslations
                  ? "bg-teal-100 text-teal-700 border border-teal-200"
                  : "bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100"
              }`}
              onClick={() => setShowTranslations(!showTranslations)}
              type="button">
              {showTranslations ? "👁 Hide Known" : "👁 Peek All"}
            </button>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
        </div>

        <SurahStats chapterId={chapter.id} totalWords={totalWords} />

        <QuizPage showTranslations={showTranslations} words={words} />

        <div className="flex items-center justify-between mt-12">
          {currentPage > 1 ? (
            <Link
              className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-colors"
              href={href(currentPage - 1)}>
              Previous
            </Link>
          ) : (
            <span className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium opacity-50">
              Previous
            </span>
          )}

          <span className="text-slate-600 font-medium">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              href={href(currentPage + 1)}>
              Next
            </Link>
          ) : (
            <span className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium opacity-50">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
