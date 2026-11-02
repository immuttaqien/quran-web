import { describe, expect, test } from "bun:test"
import {
  applyAnswer,
  DAY_MS,
  formatWait,
  INTERVAL_DAYS,
  isDue,
  MAX_BOX,
  nextDueAt,
  RELEARN_MS,
  type Schedule,
  SESSION_LIMIT,
  selectDue,
} from "@/lib/srs"

const NOW = 1_700_000_000_000

/** Kartu minimal untuk menguji penjadwalan. */
const card = (due: number): Schedule => ({ box: 0, due })

describe("applyAnswer", () => {
  test("jawaban benar menaikkan kotak dan menjadwalkan sesuai jeda", () => {
    expect(applyAnswer(0, true, NOW)).toEqual({ box: 1, due: NOW + DAY_MS })
    expect(applyAnswer(1, true, NOW)).toEqual({ box: 2, due: NOW + 3 * DAY_MS })
  })

  test("kotak tidak melewati batas atas", () => {
    expect(applyAnswer(MAX_BOX, true, NOW)).toEqual({
      box: MAX_BOX,
      due: NOW + INTERVAL_DAYS[MAX_BOX] * DAY_MS,
    })
  })

  test("jawaban salah kembali ke kotak 0 dengan jeda singkat", () => {
    expect(applyAnswer(4, false, NOW)).toEqual({
      box: 0,
      due: NOW + RELEARN_MS,
    })
  })

  test("jeda selalu bertambah seiring kotak", () => {
    for (let i = 1; i < INTERVAL_DAYS.length; i++) {
      expect(INTERVAL_DAYS[i]).toBeGreaterThan(INTERVAL_DAYS[i - 1])
    }
  })
})

describe("selectDue", () => {
  const cards = [card(NOW + 5), card(NOW - 50), card(NOW - 10), card(NOW)]

  test("hanya yang jatuh tempo, paling lama menunggu lebih dulu", () => {
    expect(selectDue(cards, NOW).map((card) => card.due)).toEqual([
      NOW - 50,
      NOW - 10,
      NOW,
    ])
  })

  test("jatuh tempo tepat pada batas waktunya", () => {
    expect(isDue(card(NOW), NOW)).toBe(true)
    expect(isDue(card(NOW + 1), NOW)).toBe(false)
  })

  test("dibatasi per sesi", () => {
    const many = Array.from({ length: 50 }, () => card(0))
    expect(selectDue(many, NOW)).toHaveLength(SESSION_LIMIT)
    expect(selectDue(many, NOW, 3)).toHaveLength(3)
  })

  test("tidak mengubah array masukan", () => {
    const input = [card(3), card(1), card(2)]
    selectDue(input, NOW)
    expect(input.map((card) => card.due)).toEqual([3, 1, 2])
  })
})

describe("nextDueAt", () => {
  test("terdekat di antara yang belum jatuh tempo", () => {
    expect(nextDueAt([card(NOW + 9), card(NOW + 5), card(1)], NOW)).toBe(
      NOW + 5
    )
  })

  test("null bila tidak ada yang akan datang", () => {
    expect(nextDueAt([card(1)], NOW)).toBeNull()
    expect(nextDueAt([], NOW)).toBeNull()
  })
})

describe("formatWait", () => {
  const HOUR = 60 * 60 * 1000

  test.each([
    [30 * 60 * 1000, "kurang dari 1 jam"],
    [HOUR, "1 jam"],
    [5 * HOUR, "5 jam"],
    [23.4 * HOUR, "23 jam"],
    // Dibulatkan dulu: hampir 24 jam harus "1 hari", bukan "24 jam".
    [23.99 * HOUR, "1 hari"],
    [3 * DAY_MS, "3 hari"],
    [47 * HOUR, "2 hari"],
  ])("%d ms -> %s", (ms, expected) => {
    expect(formatWait(ms)).toBe(expected)
  })
})
