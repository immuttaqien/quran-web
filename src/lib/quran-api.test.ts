import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

// unstable_cache butuh konteks server Next.js; di uji cukup meneruskan fungsinya.
mock.module("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }))

const {
  getChapter,
  getChapterPage,
  getChapters,
  getChapterWordCount,
  QuranApiError,
  VERSES_PER_PAGE,
} = await import("@/lib/quran-api")

const realFetch = globalThis.fetch
let requested: URL[]

function respond(handler: (url: URL) => { status?: number; body: unknown }) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input))
    requested.push(url)
    const { status = 200, body } = handler(url)
    return new Response(JSON.stringify(body), { status })
  }) as typeof fetch
}

beforeEach(() => {
  requested = []
})
afterEach(() => {
  globalThis.fetch = realFetch
})

const apiChapter = (id: number) => ({
  id,
  name_simple: `Surah-${id}`,
  name_arabic: "سورة",
  verses_count: 7,
  revelation_place: "makkah",
  translated_name: { name: `Nama ${id}` },
})

const apiWord = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  position: id,
  char_type_name: "word",
  text_uthmani: `ك${id}`,
  transliteration: { text: `tr${id}` },
  translation: { text: `T${id}` },
  ...extra,
})

describe("getChapters / getChapter", () => {
  test("memetakan field API ke bentuk aplikasi", async () => {
    respond(() => ({ body: { chapters: [apiChapter(1), apiChapter(2)] } }))

    const chapters = await getChapters()

    expect(chapters).toHaveLength(2)
    expect(chapters[0]).toEqual({
      id: 1,
      nameSimple: "Surah-1",
      nameArabic: "سورة",
      nameTranslated: "Nama 1",
      versesCount: 7,
      revelationPlace: "makkah",
    })
    expect(requested[0].pathname).toBe("/api/v4/chapters")
    expect(requested[0].searchParams.get("language")).toBe("id")
  })

  test("terjemahan nama yang hilang menjadi string kosong", async () => {
    respond(() => ({
      body: { chapter: { ...apiChapter(3), translated_name: undefined } },
    }))

    expect((await getChapter(3)).nameTranslated).toBe("")
    expect(requested[0].pathname).toBe("/api/v4/chapters/3")
  })
})

describe("getChapterPage", () => {
  const handler = (url: URL) =>
    url.pathname.includes("/verses/")
      ? {
          body: {
            verses: [
              {
                verse_key: "1:1",
                words: [
                  apiWord(1),
                  apiWord(2, { text_uthmani: undefined, text: "fallback" }),
                  apiWord(3, {
                    transliteration: undefined,
                    translation: { text: null },
                  }),
                  { id: 9, position: 4, char_type_name: "end", text: "١" },
                ],
              },
            ],
            pagination: { current_page: 2, total_pages: 5 },
          },
        }
      : { body: { chapter: apiChapter(1) } }

  test("hanya kata (penanda akhir ayat dibuang) dengan fallback untuk field kosong", async () => {
    respond(handler)

    const { words, pagination, chapter } = await getChapterPage(1, 2)

    expect(chapter.id).toBe(1)
    expect(pagination).toEqual({ currentPage: 2, totalPages: 5 })
    expect(words).toEqual([
      {
        id: 1,
        verseKey: "1:1",
        position: 1,
        arabic: "ك1",
        transliteration: "tr1",
        translation: "T1",
      },
      {
        id: 2,
        verseKey: "1:1",
        position: 2,
        arabic: "fallback",
        transliteration: "tr2",
        translation: "T2",
      },
      {
        id: 3,
        verseKey: "1:1",
        position: 3,
        arabic: "ك3",
        transliteration: undefined,
        translation: "",
      },
    ])
  })

  test("meminta kata per kata dengan ukuran halaman yang tetap", async () => {
    respond(handler)

    await getChapterPage(1, 2)

    const verses = requested.find((url) => url.pathname.includes("/verses/"))
    expect(verses?.pathname).toBe("/api/v4/verses/by_chapter/1")
    expect(verses?.searchParams.get("words")).toBe("true")
    expect(verses?.searchParams.get("per_page")).toBe(String(VERSES_PER_PAGE))
    expect(verses?.searchParams.get("page")).toBe("2")
  })
})

describe("kesalahan API", () => {
  test("respons tidak OK menjadi QuranApiError dengan status", async () => {
    respond(() => ({ status: 404, body: {} }))

    const error = await getChapter(999).catch((e) => e)

    expect(error).toBeInstanceOf(QuranApiError)
    expect(error.status).toBe(404)
    expect(error.message).toContain("404")
  })

  test("kesalahan server juga diteruskan", async () => {
    respond(() => ({ status: 500, body: {} }))

    await expect(getChapters()).rejects.toMatchObject({ status: 500 })
  })
})

describe("getChapterWordCount", () => {
  const verse = (n: number) => ({
    verse_key: `9:${n}`,
    words: [
      apiWord(n * 10 + 1),
      apiWord(n * 10 + 2),
      apiWord(n * 10 + 3),
      { id: n * 10 + 9, position: 4, char_type_name: "end" },
    ],
  })

  test("menjumlahkan kata dari semua halaman, tanpa penanda akhir ayat", async () => {
    respond((url) => {
      const page = Number(url.searchParams.get("page"))
      const verses = page === 3 ? [verse(1)] : [verse(1), verse(2)]
      return {
        body: { verses, pagination: { current_page: page, total_pages: 3 } },
      }
    })

    // 2 + 2 + 1 ayat, masing-masing 3 kata
    expect(await getChapterWordCount(9)).toBe(15)
    expect(requested).toHaveLength(3)
  })

  test("satu halaman saja hanya satu permintaan", async () => {
    respond(() => ({
      body: {
        verses: [verse(1)],
        pagination: { current_page: 1, total_pages: 1 },
      },
    }))

    expect(await getChapterWordCount(9)).toBe(3)
    expect(requested).toHaveLength(1)
  })
})
