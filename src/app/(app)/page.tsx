"use client"

import { useState } from "react"
import QuizPage from "@/components/quiz-page"
import { quranData } from "@/lib/quran-data"
import AppHeader from "@/components/layout/app-header"

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0)
  const [showTranslations, setShowTranslations] = useState(false)

  const page = quranData[currentPage]
  const totalPages = quranData.length

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 font-sans">{page.surah}</h1>
                <p className="text-slate-500 text-sm">
                  Page {currentPage + 1} of {totalPages}
                </p>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => setShowTranslations(!showTranslations)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  showTranslations
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100"
                }`}
              >
                {showTranslations ? "👁 Hide Known" : "👁 Peek All"}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentPage + 1) / totalPages) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Quiz Content */}
          <QuizPage page={page} showTranslations={showTranslations} />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={() => {
                setCurrentPage(Math.max(0, currentPage - 1))
                setShowTranslations(false)
              }}
              disabled={currentPage === 0}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-900 transition-colors"
            >
              Previous
            </button>

            <span className="text-slate-600 font-medium">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => {
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                setShowTranslations(false)
              }}
              disabled={currentPage === totalPages - 1}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
