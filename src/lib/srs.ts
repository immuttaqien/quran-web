/**
 * Pengulangan berjarak dengan sistem kotak Leitner.
 *
 * Setiap kata ada di sebuah kotak (0..MAX_BOX). Jawaban benar menaikkan kotak
 * sehingga jeda ulasan berikutnya makin panjang; jawaban salah mengembalikan
 * kata ke kotak 0 dan memunculkannya lagi sebentar lagi.
 */

export const DAY_MS = 24 * 60 * 60 * 1000

/** Jeda (hari) sampai ulasan berikutnya setelah menjawab benar, per kotak tujuan. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60] as const
export const MAX_BOX = INTERVAL_DAYS.length - 1

/** Jeda setelah jawaban salah, agar kata tidak langsung muncul lagi di sesi yang sama. */
export const RELEARN_MS = 10 * 60 * 1000

/** Jumlah kata maksimal dalam satu sesi ulasan. */
export const SESSION_LIMIT = 20

export interface Schedule {
  box: number
  /** Waktu (ms epoch) kata ini jatuh tempo untuk diulas. */
  due: number
}

export function applyAnswer(
  box: number,
  correct: boolean,
  now: number
): Schedule {
  if (!correct) return { box: 0, due: now + RELEARN_MS }

  const next = Math.min(Math.max(box, 0) + 1, MAX_BOX)
  return { box: next, due: now + INTERVAL_DAYS[next] * DAY_MS }
}

export function isDue(card: Schedule, now: number): boolean {
  return card.due <= now
}

/** Kartu yang jatuh tempo, yang paling lama menunggu didahulukan. */
export function selectDue<T extends Schedule>(
  cards: readonly T[],
  now: number,
  limit: number = SESSION_LIMIT
): T[] {
  return cards
    .filter((card) => isDue(card, now))
    .sort((a, b) => a.due - b.due)
    .slice(0, limit)
}

/** Waktu jatuh tempo terdekat di antara kartu yang belum jatuh tempo; null bila tidak ada. */
export function nextDueAt(
  cards: readonly Schedule[],
  now: number
): number | null {
  const upcoming = cards.filter((card) => !isDue(card, now))
  if (upcoming.length === 0) return null

  return Math.min(...upcoming.map((card) => card.due))
}

const HOUR_MS = 60 * 60 * 1000

/** Teks singkat untuk jeda waktu, mis. "kurang dari 1 jam", "5 jam", "3 hari". */
export function formatWait(ms: number): string {
  if (ms < HOUR_MS) return "kurang dari 1 jam"

  // Dibulatkan dulu: 23,9 jam harus tampil "1 hari", bukan "24 jam".
  const hours = Math.round(ms / HOUR_MS)
  if (hours < 24) return `${hours} jam`

  return `${Math.round(ms / DAY_MS)} hari`
}
