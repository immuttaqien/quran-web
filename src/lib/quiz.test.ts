import { describe, expect, test } from "bun:test"
import { buildQuestions, OPTION_COUNT, shuffle } from "@/lib/quiz"
import type { QuranWord } from "@/lib/quran-api"

const word = (id: number, arabic: string, translation: string): QuranWord => ({
  id,
  verseKey: "1:1",
  position: id,
  arabic,
  translation,
})

/** Pengacak deterministik agar uji bisa diulang. */
function seeded(seed = 1) {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

const words = [
  word(1, "a", "Dengan nama"),
  word(2, "b", "Allah"),
  word(3, "c", "Yang Maha Pengasih"),
  word(4, "d", "Yang Maha Penyayang"),
  word(5, "e", "Segala puji"),
  word(6, "f", "dan"),
  word(7, "g", "dan"),
  word(8, "h", "  "),
  word(9, "a", "Dengan nama"),
]

describe("buildQuestions", () => {
  test("membuang kata tanpa terjemahan dan kata kembar", () => {
    // id 8 (terjemahan kosong) dan id 9 (kembar id 1) dibuang.
    expect(buildQuestions(words, words, seeded())).toHaveLength(7)
  })

  test("tiap soal punya opsi unik berisi tepat satu jawaban benar", () => {
    for (const question of buildQuestions(words, words, seeded(7))) {
      expect(question.options).toHaveLength(OPTION_COUNT)
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(
        question.options.filter((o) => o === question.answer)
      ).toHaveLength(1)
    }
  })

  test("pengecoh tidak pernah sama dengan jawaban, meski ada terjemahan kembar", () => {
    const dan = buildQuestions(words, words, seeded()).filter(
      (question) => question.answer === "dan"
    )

    expect(dan).toHaveLength(2)
    for (const question of dan) {
      expect(question.options.filter((o) => o === "dan")).toHaveLength(1)
    }
  })

  test("kata tanpa pengecoh dilewati", () => {
    expect(buildQuestions([word(1, "a", "Satu")])).toEqual([])
    expect(buildQuestions([])).toEqual([])
  })

  test("dua terjemahan menghasilkan soal dengan dua opsi", () => {
    const questions = buildQuestions(
      [word(1, "a", "X"), word(2, "b", "Y")],
      undefined,
      seeded()
    )

    expect(questions).toHaveLength(2)
    expect(questions.every((q) => q.options.length === 2)).toBe(true)
  })

  test("pengecoh bisa diambil dari kumpulan yang lebih besar", () => {
    const [question] = buildQuestions([words[0]], words, seeded())

    expect(question.options).toHaveLength(OPTION_COUNT)
    expect(question.answer).toBe("Dengan nama")
  })
})

describe("shuffle", () => {
  test("permutasi tanpa mengubah array asli", () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffle(original, seeded(3))

    expect(original).toEqual([1, 2, 3, 4, 5])
    expect([...result].sort()).toEqual(original)
  })
})
