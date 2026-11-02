/**
 * Penyimpanan progres kata yang sudah dikenal di localStorage.
 *
 * Setiap kata disimpan dengan kunci lokasi "surah:ayat:posisi" (mis. "2:255:3")
 * sehingga progres bisa dihitung per surah. Seluruh daftar disimpan sebagai
 * string JSON agar bisa dipakai langsung sebagai snapshot yang stabil oleh
 * useSyncExternalStore. Bila localStorage tidak tersedia (mode privat,
 * diblokir), progres tetap tersimpan di memori selama halaman terbuka.
 *
 * Versi 1 menyimpan ID kata tanpa informasi surah, sehingga tidak dimigrasikan.
 */

import { createLocalStore } from "@/lib/local-store"

export const STORAGE_KEY = "quran-web:known-words:v2"
export const EMPTY_SNAPSHOT = "[]"

const WORD_KEY_PATTERN = /^\d+:\d+:\d+$/

const store = createLocalStore(STORAGE_KEY, EMPTY_SNAPSHOT)

export const { getSnapshot, getServerSnapshot, subscribe } = store

export function wordKey(verseKey: string, position: number): string {
  return `${verseKey}:${position}`
}

export function chapterOfKey(key: string): number {
  return Number.parseInt(key.split(":")[0], 10)
}

/** Ambil hanya kunci kata yang valid dari nilai tak tepercaya; duplikat dibuang. */
export function sanitizeKnownKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return [
    ...new Set(
      value.filter(
        (key): key is string =>
          typeof key === "string" && WORD_KEY_PATTERN.test(key)
      )
    ),
  ]
}

export function parseKnownKeys(raw: string): string[] {
  try {
    return sanitizeKnownKeys(JSON.parse(raw))
  } catch {
    return []
  }
}

/** Jumlah kata yang dikenal per nomor surah. */
export function countByChapter(keys: Iterable<string>): Map<number, number> {
  const counts = new Map<number, number>()

  for (const key of keys) {
    const chapter = chapterOfKey(key)
    counts.set(chapter, (counts.get(chapter) ?? 0) + 1)
  }

  return counts
}

/** Tandai atau batalkan tanda sebuah kata. Selalu membaca nilai terbaru dari storage. */
export function toggleKnownWord(key: string) {
  const keys = new Set(parseKnownKeys(getSnapshot()))

  if (keys.has(key)) {
    keys.delete(key)
  } else {
    keys.add(key)
  }

  store.write(JSON.stringify([...keys]))
}

/** Tandai sebuah kata sebagai dikenal (tidak membatalkan bila sudah ditandai). */
export function markKnownWord(key: string) {
  const keys = new Set(parseKnownKeys(getSnapshot()))
  if (keys.has(key)) return

  keys.add(key)
  store.write(JSON.stringify([...keys]))
}

/** Ganti seluruh daftar kata dikenal (mis. saat impor). */
export function setKnownWords(keys: Iterable<string>) {
  store.write(JSON.stringify(sanitizeKnownKeys([...keys])))
}

export function clearKnownWords() {
  store.write(EMPTY_SNAPSHOT)
}
