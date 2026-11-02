/**
 * Jadwal ulasan (pengulangan berjarak) per kata, disimpan di localStorage.
 *
 * Data kata (Arab + terjemahan) ikut disimpan agar sesi ulasan bisa berjalan
 * tanpa memanggil API lagi. Kunci kata sama dengan progres "dikenal":
 * "surah:ayat:posisi".
 */

import { createLocalStore } from "@/lib/local-store"
import type { QuranWord } from "@/lib/quran-api"
import { applyAnswer, MAX_BOX } from "@/lib/srs"

export const REVIEW_STORAGE_KEY = "quran-web:review:v1"
export const EMPTY_REVIEWS = "{}"

const WORD_KEY_PATTERN = /^\d+:\d+:\d+$/

export interface ReviewCard {
  key: string
  id: number
  verseKey: string
  position: number
  arabic: string
  translation: string
  box: number
  due: number
}

export type ReviewMap = Record<string, ReviewCard>

const store = createLocalStore(REVIEW_STORAGE_KEY, EMPTY_REVIEWS)

export const {
  getSnapshot: getReviewSnapshot,
  getServerSnapshot: getReviewServerSnapshot,
  subscribe: subscribeReviews,
} = store

function isReviewCard(key: string, value: unknown): value is ReviewCard {
  if (!WORD_KEY_PATTERN.test(key) || typeof value !== "object" || !value) {
    return false
  }

  const card = value as Record<string, unknown>

  return (
    card.key === key &&
    Number.isInteger(card.id) &&
    typeof card.verseKey === "string" &&
    Number.isInteger(card.position) &&
    typeof card.arabic === "string" &&
    typeof card.translation === "string" &&
    Number.isInteger(card.box) &&
    (card.box as number) >= 0 &&
    (card.box as number) <= MAX_BOX &&
    typeof card.due === "number" &&
    Number.isFinite(card.due)
  )
}

/** Baca snapshot; entri yang rusak dibuang, bukan membuat seluruh data gagal. */
export function parseReviews(raw: string): ReviewMap {
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(value).filter(([key, card]) => isReviewCard(key, card))
    ) as ReviewMap
  } catch {
    return {}
  }
}

function keyOf(word: Pick<QuranWord, "verseKey" | "position">) {
  return `${word.verseKey}:${word.position}`
}

function readAll(): ReviewMap {
  return parseReviews(getReviewSnapshot())
}

function writeAll(map: ReviewMap) {
  store.write(JSON.stringify(map))
}

function newCard(word: QuranWord, now: number): ReviewCard {
  return {
    key: keyOf(word),
    id: word.id,
    verseKey: word.verseKey,
    position: word.position,
    arabic: word.arabic,
    translation: word.translation,
    box: 0,
    due: now,
  }
}

/** Catat hasil menjawab sebuah kata dan jadwalkan ulasan berikutnya. */
export function recordAnswer(
  word: QuranWord,
  correct: boolean,
  now: number = Date.now()
) {
  const map = readAll()
  const card = map[keyOf(word)] ?? newCard(word, now)

  map[card.key] = { ...card, ...applyAnswer(card.box, correct, now) }
  writeAll(map)
}

/** Masukkan kata ke jadwal ulasan (jatuh tempo sekarang) bila belum ada. */
export function scheduleWord(word: QuranWord, now: number = Date.now()) {
  const map = readAll()
  if (map[keyOf(word)]) return

  map[keyOf(word)] = newCard(word, now)
  writeAll(map)
}

export function unscheduleWord(key: string) {
  const map = readAll()
  if (!map[key]) return

  delete map[key]
  writeAll(map)
}

export function reviewCardToWord(card: ReviewCard): QuranWord {
  return {
    id: card.id,
    verseKey: card.verseKey,
    position: card.position,
    arabic: card.arabic,
    translation: card.translation,
  }
}
