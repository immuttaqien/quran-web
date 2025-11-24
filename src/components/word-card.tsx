"use client"

import { QuranWord } from "@/lib/quran-data"

interface WordCardProps {
  word: QuranWord
  index: number
  isKnown: boolean
  onToggle: () => void
  showTranslation: boolean
  hidden: boolean
}

export default function WordCard({ word, isKnown, onToggle, showTranslation, hidden }: WordCardProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
        hidden ? "opacity-30" : "opacity-100"
      }`}
      onClick={onToggle}
    >
      {/* Root Form */}
      {showTranslation && (
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide min-h-5">{word.root}</div>
      )}

      {/* Arabic Text */}
      <div className="text-4xl font-bold text-slate-900 leading-tight text-center min-h-14 flex items-center">
        {word.arabic}
      </div>

      {/* Translation or Placeholder */}
      <div
        className={`text-sm font-medium text-center min-h-8 transition-all ${
          showTranslation ? "text-teal-600" : "text-slate-300 bg-slate-200 rounded px-3 py-1"
        }`}
      >
        {showTranslation ? word.translation : <span className="select-none">________</span>}
      </div>

      {/* Click indicator */}
      {/* {!showTranslation && !hidden && <div className="text-xs text-slate-400 mt-1">Click to mark as known</div>} */}
    </div>
  )
}