// Data tiruan Quran.com API untuk uji end-to-end. Murni (tanpa efek samping)
// agar bisa dipakai bersama oleh server tiruan dan oleh berkas uji.
//
// Bentuk data: 3 surah, masing-masing 7 ayat x 4 kata (+ 1 penanda akhir ayat).
// ID kata = (ayat - 1) * 5 + posisi, jadi teks Arab "ك<id>" menunjukkan lokasi
// kata dan terjemahan benarnya dapat dihitung tanpa membaca respons.

const TRANSLATIONS = [
  "Dengan nama",
  "Allah",
  "Yang Maha Pengasih",
  "Yang Maha Penyayang",
  "Segala puji",
  "bagi Allah",
  "Tuhan",
  "semesta alam",
  "Pemilik",
  "hari",
  "pembalasan",
  "Hanya kepada-Mu",
  "kami menyembah",
  "dan",
  "kami memohon",
  "pertolongan",
  "Tunjukilah",
  "kami",
  "jalan",
  "lurus",
  "jalan",
  "orang-orang",
  "yang telah",
  "Engkau beri",
  "nikmat",
  "atas mereka",
  "bukan",
  "yang dimurkai",
  "dan bukan",
  "yang sesat",
]

const CHAPTERS = [1, 2, 3]
const VERSES_PER_CHAPTER = 7
const WORDS_PER_VERSE = 4

const wordId = (verse, position) =>
  (verse - 1) * (WORDS_PER_VERSE + 1) + position
const arabicFor = (id) => `ك${id}`
const translationFor = (verse, position) =>
  TRANSLATIONS[(verse * WORDS_PER_VERSE + position - 1) % TRANSLATIONS.length]

/** Dari teks Arab "ك<id>" ke lokasi kata di dalam surah. */
function locate(arabic) {
  const id = Number(String(arabic).replace(/\D/g, ""))
  return {
    verse: Math.floor((id - 1) / (WORDS_PER_VERSE + 1)) + 1,
    position: ((id - 1) % (WORDS_PER_VERSE + 1)) + 1,
  }
}

/** Terjemahan yang benar untuk teks Arab yang tampil di layar. */
function translationForArabic(arabic) {
  const { verse, position } = locate(arabic)
  return translationFor(verse, position)
}

module.exports = {
  TRANSLATIONS,
  CHAPTERS,
  VERSES_PER_CHAPTER,
  WORDS_PER_VERSE,
  wordId,
  arabicFor,
  translationFor,
  locate,
  translationForArabic,
}
