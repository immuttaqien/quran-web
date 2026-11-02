/**
 * Audio kata per kata dari CDN Quran.com.
 *
 * Alamat berpola `wbw/<surah>_<ayat>_<posisi>.mp3` (masing-masing 3 digit),
 * sehingga bisa diturunkan dari lokasi kata tanpa data tambahan dari API.
 * Dengan begitu kata yang dimuat dari penyimpanan lokal (sesi ulasan) tetap
 * bisa diputar. Bila pola ini berubah, cukup ubah di satu tempat ini.
 */

export const WORD_AUDIO_BASE_URL = "https://audio.qurancdn.com/"

const pad = (n: number) => String(n).padStart(3, "0")

export function wordAudioUrl(verseKey: string, position: number): string {
  const [chapter, verse] = verseKey.split(":").map(Number)

  if (
    !Number.isInteger(chapter) ||
    !Number.isInteger(verse) ||
    !Number.isInteger(position) ||
    chapter < 1 ||
    verse < 1 ||
    position < 1
  ) {
    throw new Error(`Lokasi kata tidak valid: ${verseKey}:${position}`)
  }

  return `${WORD_AUDIO_BASE_URL}wbw/${pad(chapter)}_${pad(verse)}_${pad(position)}.mp3`
}
