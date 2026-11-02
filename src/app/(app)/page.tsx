import Link from "next/link"
import {
  ChapterKnownWords,
  TotalKnownWords,
} from "@/components/known-words-summary"
import AppHeader from "@/components/layout/app-header"
import { getChapters } from "@/lib/quran-api"

export default async function Home() {
  const chapters = await getChapters()

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900 font-sans mb-1">
            Daftar Surah
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {chapters.length} surah · <TotalKnownWords /> · pilih satu untuk
            mulai belajar
          </p>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-teal-200 hover:shadow-md transition-all"
                  href={`/surah/${chapter.id}`}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold text-sm">
                    {chapter.id}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-slate-900 truncate">
                      {chapter.nameSimple}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {chapter.nameTranslated} · {chapter.versesCount} ayat
                      <ChapterKnownWords chapterId={chapter.id} />
                    </span>
                  </span>
                  <span className="text-xl text-slate-900" dir="rtl">
                    {chapter.nameArabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
