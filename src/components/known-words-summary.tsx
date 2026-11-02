"use client"

import useKnownWords from "@/hooks/use-known-words"

/** Total kata yang sudah dikenal di seluruh surah. */
export function TotalKnownWords() {
  const { knownWords } = useKnownWords()

  return <>{knownWords.size.toLocaleString("id-ID")} kata dikenal</>
}

/** Jumlah kata dikenal pada satu surah; tidak tampil jika belum ada. */
export function ChapterKnownWords({ chapterId }: { chapterId: number }) {
  const { countsByChapter } = useKnownWords()
  const count = countsByChapter.get(chapterId) ?? 0

  if (count === 0) return null

  return (
    <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-teal-700">
      {count.toLocaleString("id-ID")} kata dikenal
    </span>
  )
}
