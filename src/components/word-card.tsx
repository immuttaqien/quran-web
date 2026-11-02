"use client"

import type { QuranWord } from "@/lib/quran-api"

interface WordCardProps {
  word: QuranWord
  isKnown: boolean
  onToggle: () => void
  showTranslation: boolean
  hidden: boolean
}

export default function WordCard({
  word,
  onToggle,
  showTranslation,
  hidden,
}: WordCardProps) {
  return (
    <button
      className={`flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
        hidden ? "opacity-30" : "opacity-100"
      }`}
      onClick={onToggle}
      type="button">
      {/* Transliteration */}
      {showTranslation && (
        <div className="text-xs font-medium text-slate-500 tracking-wide min-h-5">
          {word.transliteration}
        </div>
      )}

      {/* Arabic Text */}
      <div className="text-4xl font-bold text-slate-900 leading-tight text-center min-h-14 flex items-center">
        {word.arabic}
      </div>

      {/* Translation or Placeholder */}
      <div
        className={`text-sm font-medium text-center min-h-8 transition-all ${
          showTranslation
            ? "text-teal-600"
            : "text-slate-300 bg-slate-200 rounded px-3 py-1"
        }`}>
        {showTranslation ? (
          word.translation
        ) : (
          <span className="select-none">________</span>
        )}
      </div>
    </button>
  )
}
