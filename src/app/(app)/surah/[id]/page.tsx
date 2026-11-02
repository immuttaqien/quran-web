import { notFound } from "next/navigation"
import AppHeader from "@/components/layout/app-header"
import SurahReader from "@/components/surah-reader"
import {
  getChapterPage,
  getChapterWordCount,
  QuranApiError,
} from "@/lib/quran-api"

interface SurahPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export default async function SurahPage({
  params,
  searchParams,
}: SurahPageProps) {
  const { id } = await params
  const { page } = await searchParams

  const chapterId = parsePositiveInt(id, 0)
  if (chapterId < 1 || chapterId > 114) notFound()

  const [data, totalWords] = await Promise.all([
    getChapterPage(chapterId, parsePositiveInt(page, 1)).catch((error) => {
      if (error instanceof QuranApiError && error.status === 404) notFound()
      throw error
    }),
    // Statistik bersifat pelengkap: kegagalan menghitung tidak boleh merusak halaman.
    getChapterWordCount(chapterId).catch(() => null),
  ])

  return (
    <>
      <AppHeader />
      <SurahReader
        key={`${chapterId}-${data.pagination.currentPage}`}
        {...data}
        totalWords={totalWords}
      />
    </>
  )
}
