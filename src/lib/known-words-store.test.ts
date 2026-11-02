import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
  chapterOfKey,
  clearKnownWords,
  countByChapter,
  getServerSnapshot,
  getSnapshot,
  markKnownWord,
  parseKnownKeys,
  STORAGE_KEY,
  sanitizeKnownKeys,
  setKnownWords,
  subscribe,
  toggleKnownWord,
  wordKey,
} from "@/lib/known-words-store"
import { type FakeBrowser, installFakeBrowser } from "@/test/fake-browser"

let browser: FakeBrowser

beforeEach(() => {
  browser = installFakeBrowser()
  clearKnownWords()
})

afterEach(() => browser.uninstall())

const known = () => parseKnownKeys(getSnapshot())

describe("kunci kata", () => {
  test("wordKey dan chapterOfKey", () => {
    expect(wordKey("2:255", 3)).toBe("2:255:3")
    expect(chapterOfKey("2:255:3")).toBe(2)
  })

  test("sanitizeKnownKeys membuang entri tidak valid dan duplikat", () => {
    expect(
      sanitizeKnownKeys([
        "1:1:1",
        "1:1:1",
        "bad",
        7,
        null,
        "<script>",
        "3:4:5",
        "1:1",
      ])
    ).toEqual(["1:1:1", "3:4:5"])
    expect(sanitizeKnownKeys("bukan array")).toEqual([])
    expect(sanitizeKnownKeys({ 0: "1:1:1" })).toEqual([])
  })

  test("parseKnownKeys menoleransi JSON rusak", () => {
    expect(parseKnownKeys("{oops")).toEqual([])
    expect(parseKnownKeys('{"a":1}')).toEqual([])
    expect(parseKnownKeys('["1:1:1", 5, "x"]')).toEqual(["1:1:1"])
  })
})

describe("menandai kata", () => {
  test("toggle menambah lalu menghapus", () => {
    toggleKnownWord("1:1:1")
    toggleKnownWord("1:2:1")
    expect(known()).toEqual(["1:1:1", "1:2:1"])

    toggleKnownWord("1:1:1")
    expect(known()).toEqual(["1:2:1"])
  })

  test("markKnownWord idempoten dan tidak membatalkan", () => {
    markKnownWord("2:255:3")
    markKnownWord("2:255:3")
    expect(known()).toEqual(["2:255:3"])
  })

  test("setKnownWords mengganti seluruhnya dengan data yang disaring", () => {
    toggleKnownWord("9:9:9")
    setKnownWords(["1:1:1", "1:1:1", "zzz", "2:2:2"])
    expect(known()).toEqual(["1:1:1", "2:2:2"])
  })

  test("clearKnownWords mengosongkan", () => {
    toggleKnownWord("1:1:1")
    clearKnownWords()
    expect(known()).toEqual([])
  })
})

describe("countByChapter", () => {
  test("menghitung per surah", () => {
    const counts = countByChapter(["1:1:1", "1:2:1", "2:255:3"])
    expect([...counts]).toEqual([
      [1, 2],
      [2, 1],
    ])
  })

  test("kosong", () => {
    expect(countByChapter([]).size).toBe(0)
  })
})

describe("subscribe", () => {
  test("memberi tahu saat berubah dan berhenti setelah unsubscribe", () => {
    let calls = 0
    const unsubscribe = subscribe(() => calls++)

    toggleKnownWord("5:5:5")
    expect(calls).toBe(1)

    unsubscribe()
    toggleKnownWord("5:5:6")
    expect(calls).toBe(1)
  })
})

describe("snapshot", () => {
  test("snapshot server selalu kosong", () => {
    expect(getServerSnapshot()).toBe("[]")
  })

  test("disimpan di kunci v2, bukan v1", () => {
    toggleKnownWord("1:1:1")
    expect(browser.storage.has(STORAGE_KEY)).toBe(true)
    expect(STORAGE_KEY).toContain(":v2")
    expect(browser.storage.has("quran-web:known-words:v1")).toBe(false)
  })

  test("tetap bekerja di memori saat localStorage diblokir", () => {
    browser.setBlocked(true)
    clearKnownWords() // menyetel ulang memori ke kosong

    toggleKnownWord("7:7:7")
    expect(known()).toEqual(["7:7:7"])

    toggleKnownWord("7:7:7")
    expect(known()).toEqual([])
  })
})
