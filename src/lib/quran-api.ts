/**
 * Client untuk Quran.com API v4 (https://api-docs.quran.foundation).
 * Dipanggil dari Server Component, respons di-cache oleh Next.js.
 */

const BASE_URL = "https://api.quran.com/api/v4"

// Teks Al-Quran tidak berubah, jadi cache panjang (24 jam).
const REVALIDATE_SECONDS = 60 * 60 * 24

export const VERSES_PER_PAGE = 5

export interface Chapter {
  id: number
  nameSimple: string
  nameArabic: string
  nameTranslated: string
  versesCount: number
  revelationPlace: string
}

export interface QuranWord {
  id: number
  verseKey: string
  arabic: string
  transliteration?: string
  translation: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
}

export interface ChapterPage {
  chapter: Chapter
  words: QuranWord[]
  pagination: Pagination
}

interface ApiChapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  revelation_place: string
  translated_name?: { name: string }
}

interface ApiWord {
  id: number
  position: number
  char_type_name: string
  text?: string
  text_uthmani?: string
  transliteration?: { text: string | null }
  translation?: { text: string | null }
}

interface ApiVerse {
  verse_key: string
  words: ApiWord[]
}

interface ApiPagination {
  current_page: number
  total_pages: number
}

export class QuranApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "QuranApiError"
    this.status = status
  }
}

async function request<T>(
  path: string,
  params: Record<string, string | number | boolean>
): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  )
  const url = `${BASE_URL}${path}?${query}`

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })

  if (!res.ok) {
    throw new QuranApiError(
      `Quran API request failed (${res.status}): ${path}`,
      res.status
    )
  }

  return (await res.json()) as T
}

function toChapter(chapter: ApiChapter): Chapter {
  return {
    id: chapter.id,
    nameSimple: chapter.name_simple,
    nameArabic: chapter.name_arabic,
    nameTranslated: chapter.translated_name?.name ?? "",
    versesCount: chapter.verses_count,
    revelationPlace: chapter.revelation_place,
  }
}

export async function getChapters(): Promise<Chapter[]> {
  const data = await request<{ chapters: ApiChapter[] }>("/chapters", {
    language: "id",
  })

  return data.chapters.map(toChapter)
}

export async function getChapter(id: number): Promise<Chapter> {
  const data = await request<{ chapter: ApiChapter }>(`/chapters/${id}`, {
    language: "id",
  })

  return toChapter(data.chapter)
}

/**
 * Ambil satu halaman ayat dari sebuah surah beserta terjemahan kata per kata.
 * Penanda akhir ayat (char_type_name !== "word") tidak ikut dimasukkan.
 */
export async function getChapterPage(
  chapterId: number,
  page: number
): Promise<ChapterPage> {
  const [chapter, verses] = await Promise.all([
    getChapter(chapterId),
    request<{ verses: ApiVerse[]; pagination: ApiPagination }>(
      `/verses/by_chapter/${chapterId}`,
      {
        language: "id",
        words: true,
        word_fields: "text_uthmani",
        per_page: VERSES_PER_PAGE,
        page,
      }
    ),
  ])

  const words = verses.verses.flatMap((verse) =>
    verse.words
      .filter((word) => word.char_type_name === "word")
      .map((word) => ({
        id: word.id,
        verseKey: verse.verse_key,
        arabic: word.text_uthmani ?? word.text ?? "",
        transliteration: word.transliteration?.text ?? undefined,
        translation: word.translation?.text ?? "",
      }))
  )

  return {
    chapter,
    words,
    pagination: {
      currentPage: verses.pagination.current_page,
      totalPages: verses.pagination.total_pages,
    },
  }
}
