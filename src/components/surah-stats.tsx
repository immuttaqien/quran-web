"use client"

import useKnownWords from "@/hooks/use-known-words"

interface SurahStatsProps {
  chapterId: number
  /** Total kata dalam surah; null bila gagal dihitung. */
  totalWords: number | null
}

export default function SurahStats({ chapterId, totalWords }: SurahStatsProps) {
  const { countsByChapter } = useKnownWords()
  const known = countsByChapter.get(chapterId) ?? 0
  const percent =
    totalWords && totalWords > 0
      ? Math.min(100, Math.round((known / totalWords) * 100))
      : null

  return (
    <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">Progres surah ini</span>
        <span className="text-slate-500">
          {known.toLocaleString("id-ID")}
          {totalWords !== null && ` / ${totalWords.toLocaleString("id-ID")}`}{" "}
          kata dikenal{percent !== null && ` (${percent}%)`}
        </span>
      </div>
      {percent !== null && (
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  )
}
