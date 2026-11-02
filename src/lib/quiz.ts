import type { QuranWord } from "@/lib/quran-api"

export const OPTION_COUNT = 4

export interface QuizQuestion {
  word: QuranWord
  /** Pilihan jawaban (terjemahan), sudah diacak. */
  options: string[]
  answer: string
}

export type Random = () => number

/** Fisher–Yates; tidak mengubah array asli. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random) {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/** Buang kata tanpa terjemahan dan kata kembar (Arab + terjemahan sama). */
function uniqueWords(words: readonly QuranWord[]) {
  const seen = new Set<string>()

  return words.filter((word) => {
    const translation = word.translation.trim()
    if (!translation) return false

    const signature = `${word.arabic}|${translation}`
    if (seen.has(signature)) return false

    seen.add(signature)
    return true
  })
}

/**
 * Susun soal pilihan ganda dari daftar kata.
 *
 * Pengecoh diambil dari terjemahan kata lain pada daftar yang sama, dan tidak
 * pernah sama dengan jawaban benar. Kata yang tidak punya cukup pengecoh
 * (minimal satu) dilewati, jadi hasilnya bisa lebih sedikit dari masukan.
 * `pool` memungkinkan pengecoh diambil dari kumpulan yang lebih besar daripada
 * kata yang diujikan (mis. saat mengulang soal yang salah).
 */
export function buildQuestions(
  words: readonly QuranWord[],
  pool: readonly QuranWord[] = words,
  random: Random = Math.random
): QuizQuestion[] {
  const translations = [
    ...new Set(uniqueWords(pool).map((word) => word.translation.trim())),
  ]

  const questions = uniqueWords(words).flatMap((word) => {
    const answer = word.translation.trim()
    const distractors = shuffle(
      translations.filter((translation) => translation !== answer),
      random
    ).slice(0, OPTION_COUNT - 1)

    if (distractors.length === 0) return []

    return [
      { word, answer, options: shuffle([answer, ...distractors], random) },
    ]
  })

  return shuffle(questions, random)
}
