/**
 * Ekspor/impor progres belajar sebagai file JSON.
 *
 * File impor berasal dari luar, jadi selalu divalidasi: entri yang tidak
 * valid dibuang (dan dihitung), bukan dipercaya begitu saja.
 */

import { sanitizeKnownKeys } from "@/lib/known-words-store"
import { type ReviewMap, sanitizeReviews } from "@/lib/review-store"

export const BACKUP_APP = "quran-web"
export const BACKUP_VERSION = 1
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export interface Progress {
  knownWords: string[]
  reviews: ReviewMap
}

export interface Backup extends Progress {
  app: typeof BACKUP_APP
  version: typeof BACKUP_VERSION
  exportedAt: string
}

export type ParseResult =
  | { ok: true; progress: Progress; skipped: number }
  | { ok: false; error: string }

export function createBackup(
  progress: Progress,
  now: Date = new Date()
): Backup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    knownWords: progress.knownWords,
    reviews: progress.reviews,
  }
}

export function backupFileName(now: Date = new Date()): string {
  return `quran-web-progres-${now.toISOString().slice(0, 10)}.json`
}

export function parseBackup(text: string): ParseResult {
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: "File terlalu besar (maksimal 5 MB)." }
  }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: "File bukan JSON yang valid." }
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, error: "Format file tidak dikenali." }
  }

  const backup = data as Record<string, unknown>

  if (backup.app !== BACKUP_APP) {
    return { ok: false, error: "File ini bukan cadangan progres Quran Web." }
  }

  if (backup.version !== BACKUP_VERSION) {
    return {
      ok: false,
      error: `Versi cadangan tidak didukung (${String(backup.version)}).`,
    }
  }

  if (!Array.isArray(backup.knownWords)) {
    return { ok: false, error: "Daftar kata dikenal tidak ditemukan di file." }
  }

  if (
    typeof backup.reviews !== "object" ||
    backup.reviews === null ||
    Array.isArray(backup.reviews)
  ) {
    return { ok: false, error: "Jadwal ulasan tidak ditemukan di file." }
  }

  const knownWords = sanitizeKnownKeys(backup.knownWords)
  const reviews = sanitizeReviews(backup.reviews)

  const skipped =
    backup.knownWords.length -
    knownWords.length +
    (Object.keys(backup.reviews).length - Object.keys(reviews).length)

  return { ok: true, progress: { knownWords, reviews }, skipped }
}

/**
 * Gabungkan dua progres. Kata dikenal digabung (union). Untuk jadwal ulasan
 * yang ada di keduanya, dipakai yang kotaknya lebih tinggi; bila sama, yang
 * jatuh temponya lebih akhir.
 */
export function mergeProgress(current: Progress, incoming: Progress): Progress {
  const reviews: ReviewMap = { ...current.reviews }

  for (const [key, card] of Object.entries(incoming.reviews)) {
    const existing = reviews[key]

    if (
      !existing ||
      card.box > existing.box ||
      (card.box === existing.box && card.due > existing.due)
    ) {
      reviews[key] = card
    }
  }

  return {
    knownWords: [...new Set([...current.knownWords, ...incoming.knownWords])],
    reviews,
  }
}
