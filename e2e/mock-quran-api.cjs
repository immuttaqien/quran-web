// Dimuat lewat NODE_OPTIONS=--require ke proses server Next (build dan start)
// agar uji tidak bergantung pada api.quran.com. Permintaan ke host lain
// (mis. API whitelabel) dijawab 404 dengan cepat.
const data = require("./mock-data.cjs")

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })

const chapter = (id) => ({
  id,
  name_simple: `Surah-${id}`,
  name_arabic: "سورة",
  verses_count: data.VERSES_PER_CHAPTER,
  revelation_place: "makkah",
  translated_name: { name: `Nama ${id}` },
})

const verse = (number) => ({
  verse_key: `1:${number}`,
  words: [
    ...Array.from({ length: data.WORDS_PER_VERSE }, (_, i) => {
      const position = i + 1
      const id = data.wordId(number, position)
      return {
        id,
        position,
        char_type_name: "word",
        text_uthmani: data.arabicFor(id),
        transliteration: { text: `tr${id}` },
        translation: { text: data.translationFor(number, position) },
      }
    }),
    {
      id: data.wordId(number, data.WORDS_PER_VERSE + 1),
      position: data.WORDS_PER_VERSE + 1,
      char_type_name: "end",
      text_uthmani: String(number),
    },
  ],
})

globalThis.fetch = async (input) => {
  const url = new URL(
    typeof input === "string" ? input : (input.url ?? String(input))
  )

  if (url.hostname !== "api.quran.com")
    return json({ message: "mock offline" }, 404)

  const path = url.pathname.replace("/api/v4", "")

  if (path === "/chapters")
    return json({ chapters: data.CHAPTERS.map(chapter) })

  let match = path.match(/^\/chapters\/(\d+)$/)
  if (match) return json({ chapter: chapter(Number(match[1])) })

  match = path.match(/^\/verses\/by_chapter\/(\d+)$/)
  if (match) {
    const perPage = Number(url.searchParams.get("per_page"))
    const page = Number(url.searchParams.get("page"))
    const all = Array.from({ length: data.VERSES_PER_CHAPTER }, (_, i) =>
      verse(i + 1)
    )

    return json({
      verses: all.slice((page - 1) * perPage, page * perPage),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(all.length / perPage),
      },
    })
  }

  return json({ message: "not found" }, 404)
}
