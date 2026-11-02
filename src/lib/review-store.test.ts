import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import type { QuranWord } from "@/lib/quran-api"
import {
  clearReviews,
  getReviewSnapshot,
  parseReviews,
  REVIEW_STORAGE_KEY,
  recordAnswer,
  reviewCardToWord,
  sanitizeReviews,
  scheduleWord,
  setReviews,
  unscheduleWord,
} from "@/lib/review-store"
import { DAY_MS, RELEARN_MS } from "@/lib/srs"
import { type FakeBrowser, installFakeBrowser } from "@/test/fake-browser"

const T0 = 1_700_000_000_000

let browser: FakeBrowser

beforeEach(() => {
  browser = installFakeBrowser()
  clearReviews()
})

afterEach(() => browser.uninstall())

const word = (id: number, verseKey = "1:1"): QuranWord => ({
  id,
  verseKey,
  position: id,
  arabic: `ك${id}`,
  translation: `T${id}`,
})

const reviews = () => parseReviews(getReviewSnapshot())

const card = (key: string, overrides: Record<string, unknown> = {}) => {
  const [chapter, verse, position] = key.split(":")
  return {
    key,
    id: Number(position),
    verseKey: `${chapter}:${verse}`,
    position: Number(position),
    arabic: "ك",
    translation: "T",
    box: 1,
    due: 1000,
    ...overrides,
  }
}

describe("recordAnswer", () => {
  test("kata baru yang benar masuk kotak 1 dan jatuh tempo besok", () => {
    recordAnswer(word(1), true, T0)

    expect(reviews()["1:1:1"]).toMatchObject({ box: 1, due: T0 + DAY_MS })
  })

  test("benar berulang menaikkan kotak; salah mengembalikan ke 0", () => {
    recordAnswer(word(1), true, T0)
    recordAnswer(word(1), true, T0 + DAY_MS)
    expect(reviews()["1:1:1"].box).toBe(2)

    recordAnswer(word(1), false, T0 + 5 * DAY_MS)
    expect(reviews()["1:1:1"]).toMatchObject({
      box: 0,
      due: T0 + 5 * DAY_MS + RELEARN_MS,
    })
  })

  test("kata baru yang salah mulai di kotak 0", () => {
    recordAnswer(word(2), false, T0)
    expect(reviews()["1:1:2"].box).toBe(0)
  })
})

describe("scheduleWord / unscheduleWord", () => {
  test("menjadwalkan jatuh tempo sekarang dan tidak menimpa yang sudah ada", () => {
    scheduleWord(word(3), T0)
    scheduleWord({ ...word(3), translation: "diabaikan" }, T0 + 99)

    expect(reviews()["1:1:3"]).toMatchObject({ due: T0, translation: "T3" })
  })

  test("unschedule menghapus, dan aman bila tidak ada", () => {
    scheduleWord(word(3), T0)
    unscheduleWord("1:1:3")
    unscheduleWord("9:9:9")

    expect(reviews()["1:1:3"]).toBeUndefined()
  })

  test("reviewCardToWord mengembalikan data kata", () => {
    scheduleWord(word(1), T0)

    expect(reviewCardToWord(reviews()["1:1:1"])).toEqual(word(1))
  })
})

describe("data tidak tepercaya", () => {
  test("entri tidak valid dibuang, yang valid tetap", () => {
    const good = card("1:1:1")

    expect(
      Object.keys(
        sanitizeReviews({
          "1:1:1": good,
          bad: good,
          "1:1:2": card("1:1:2", { box: 99 }),
          "1:1:3": card("1:1:3", { arabic: "a".repeat(201) }),
          "1:1:4": card("1:1:4", { due: "x" }),
          "1:1:5": card("1:1:5", { key: "1:1:6" }),
          "1:1:7": "string",
        })
      )
    ).toEqual(["1:1:1"])
  })

  test.each(["{oops", "[]", "null", "5"])("parseReviews(%p) -> {}", (raw) => {
    expect(parseReviews(raw)).toEqual({})
  })

  test("__proto__ tidak mencemari objek", () => {
    const result = parseReviews('{"__proto__":{"key":"1:1:1"}}')

    expect(result).toEqual({})
    expect(({} as { key?: string }).key).toBeUndefined()
  })

  test("setReviews menyaring entri tidak valid", () => {
    setReviews({ "1:1:1": card("1:1:1"), bad: card("1:1:2") } as never)

    expect(Object.keys(reviews())).toEqual(["1:1:1"])
  })
})

describe("penyimpanan", () => {
  test("memakai kunci khusus", () => {
    recordAnswer(word(1), true, T0)
    expect(browser.storage.has(REVIEW_STORAGE_KEY)).toBe(true)
  })

  test("tetap bekerja di memori saat localStorage diblokir", () => {
    browser.setBlocked(true)
    clearReviews()

    recordAnswer(word(7), true, T0)
    expect(reviews()["1:1:7"].box).toBe(1)
  })
})
