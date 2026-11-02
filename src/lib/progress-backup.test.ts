import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
  BACKUP_APP,
  BACKUP_VERSION,
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  mergeProgress,
  type Progress,
  parseBackup,
} from "@/lib/progress-backup"
import type { ReviewCard } from "@/lib/review-store"
import { type FakeBrowser, installFakeBrowser } from "@/test/fake-browser"

let browser: FakeBrowser

// Modul yang diimpor menyentuh `window` saat dipanggil; pasang agar aman.
beforeEach(() => {
  browser = installFakeBrowser()
})
afterEach(() => browser.uninstall())

const card = (key: string, box = 1, due = 1000): ReviewCard => {
  const [chapter, verse, position] = key.split(":")
  return {
    key,
    id: Number(position),
    verseKey: `${chapter}:${verse}`,
    position: Number(position),
    arabic: "ك",
    translation: "T",
    box,
    due,
  }
}

const valid = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    knownWords: [],
    reviews: {},
    ...overrides,
  })

describe("createBackup", () => {
  const now = new Date("2026-11-02T10:00:00Z")
  const progress: Progress = {
    knownWords: ["1:1:1", "2:255:3"],
    reviews: { "1:1:1": card("1:1:1", 2, 5000) },
  }

  test("menyertakan penanda aplikasi, versi, dan waktu ekspor", () => {
    expect(createBackup(progress, now)).toEqual({
      app: "quran-web",
      version: 1,
      exportedAt: "2026-11-02T10:00:00.000Z",
      ...progress,
    })
  })

  test("nama file memuat tanggal", () => {
    expect(backupFileName(now)).toBe("quran-web-progres-2026-11-02.json")
  })

  test("bolak-balik ekspor lalu impor menghasilkan data yang sama", () => {
    const result = parseBackup(JSON.stringify(createBackup(progress, now)))

    expect(result).toEqual({ ok: true, progress, skipped: 0 })
  })
})

describe("parseBackup: penolakan", () => {
  test.each([
    ["{oops", /bukan JSON/],
    ["[]", /tidak dikenali/],
    ["null", /tidak dikenali/],
    ["5", /tidak dikenali/],
    [valid({ app: "lain" }), /bukan cadangan/],
    [valid({ version: 2 }), /Versi/],
    [valid({ knownWords: undefined }), /kata dikenal/],
    [valid({ knownWords: "x" }), /kata dikenal/],
    [valid({ reviews: [] }), /Jadwal/],
    [valid({ reviews: null }), /Jadwal/],
  ])("%s", (text, message) => {
    const result = parseBackup(text)

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(message)
  })

  test("file terlalu besar", () => {
    expect(parseBackup("x".repeat(MAX_BACKUP_BYTES + 1)).ok).toBe(false)
  })
})

describe("parseBackup: data kotor", () => {
  test("entri tidak valid dibuang dan dihitung", () => {
    const result = parseBackup(
      valid({
        knownWords: ["1:1:1", "1:1:1", "bad", 7, null, "<script>", "3:4:5"],
        reviews: {
          "1:1:1": card("1:1:1"),
          x: card("1:1:2"),
          "1:1:2": { ...card("1:1:2"), box: 99 },
          "1:1:3": { ...card("1:1:3"), arabic: "a".repeat(201) },
          "1:1:4": { ...card("1:1:4"), key: "1:1:5" },
        },
      })
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.progress.knownWords).toEqual(["1:1:1", "3:4:5"])
    expect(Object.keys(result.progress.reviews)).toEqual(["1:1:1"])
    // 7 kata dikenal -> 2 valid (5 terbuang); 5 jadwal -> 1 valid (4 terbuang)
    expect(result.skipped).toBe(5 + 4)
  })

  test("__proto__ pada reviews tidak berdampak", () => {
    const result = parseBackup(
      '{"app":"quran-web","version":1,"knownWords":[],"reviews":{"__proto__":{"key":"1:1:1"}}}'
    )

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.progress.reviews).toEqual({})
    expect(({} as { key?: string }).key).toBeUndefined()
  })
})

describe("mergeProgress", () => {
  const current: Progress = {
    knownWords: ["1:1:1", "1:1:2"],
    reviews: {
      "1:1:1": card("1:1:1", 1, 100),
      "1:1:2": card("1:1:2", 3, 100),
      "1:1:3": card("1:1:3", 2, 500),
    },
  }
  const incoming: Progress = {
    knownWords: ["1:1:2", "5:5:5"],
    reviews: {
      "1:1:1": card("1:1:1", 4, 50),
      "1:1:2": card("1:1:2", 1, 999),
      "1:1:3": card("1:1:3", 2, 900),
      "9:9:9": card("9:9:9", 0, 1),
    },
  }

  test("kata dikenal digabung (union)", () => {
    expect(mergeProgress(current, incoming).knownWords.sort()).toEqual([
      "1:1:1",
      "1:1:2",
      "5:5:5",
    ])
  })

  test("jadwal: kotak lebih tinggi menang; sama -> jatuh tempo lebih akhir", () => {
    const { reviews } = mergeProgress(current, incoming)

    expect(reviews["1:1:1"].box).toBe(4)
    expect(reviews["1:1:2"].box).toBe(3)
    expect(reviews["1:1:3"].due).toBe(900)
    expect(reviews["9:9:9"]).toBeDefined()
  })

  test("tidak mengubah masukan", () => {
    mergeProgress(current, incoming)

    expect(current.reviews["1:1:1"].box).toBe(1)
    expect(current.knownWords).toEqual(["1:1:1", "1:1:2"])
  })
})
