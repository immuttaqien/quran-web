import { notFound } from "next/navigation"
import AppHeader from "@/components/layout/app-header"
import QuizMode from "@/components/quiz-mode"
import { getChapterPage, QuranApiError } from "@/lib/quran-api"
import { parsePositiveInt } from "@/lib/utils"

interface QuizPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function SurahQuizPage({
  params,
  searchParams,
}: QuizPageProps) {
  const { id } = await params
  const { page } = await searchParams

  const chapterId = parsePositiveInt(id, 0)
  if (chapterId < 1 || chapterId > 114) notFound()

  const data = await getChapterPage(chapterId, parsePositiveInt(page, 1)).catch(
    (error) => {
      if (error instanceof QuranApiError && error.status === 404) notFound()
      throw error
    }
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Daftar Surah", href: "/" },
          {
            label: data.chapter.nameSimple,
            href: `/surah/${chapterId}?page=${data.pagination.currentPage}`,
          },
          { label: "Kuis", active: true },
        ]}
      />
      <QuizMode
        chapter={data.chapter}
        key={`${chapterId}-${data.pagination.currentPage}`}
        page={data.pagination.currentPage}
        words={data.words}
      />
    </>
  )
}
