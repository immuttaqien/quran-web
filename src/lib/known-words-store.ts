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

export const STORAGE_KEY = "quran-web:known-words:v2"
export const CHANGE_EVENT = "quran-web:known-words-change"
export const EMPTY_SNAPSHOT = "[]"

const WORD_KEY_PATTERN = /^\d+:\d+:\d+$/

let memorySnapshot = EMPTY_SNAPSHOT

export function wordKey(verseKey: string, position: number): string {
  return `${verseKey}:${position}`
}

export function chapterOfKey(key: string): number {
  return Number.parseInt(key.split(":")[0], 10)
}

export function parseKnownKeys(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter(
      (key): key is string =>
        typeof key === "string" && WORD_KEY_PATTERN.test(key)
    )
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

export function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT
  } catch {
    return memorySnapshot
  }
}

export function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT
}

export function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function write(keys: string[]) {
  const raw = JSON.stringify(keys)
  memorySnapshot = raw

  try {
    window.localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // Penyimpanan penuh atau diblokir: pakai memori saja.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Tandai atau batalkan tanda sebuah kata. Selalu membaca nilai terbaru dari storage. */
export function toggleKnownWord(key: string) {
  const keys = new Set(parseKnownKeys(getSnapshot()))

  if (keys.has(key)) {
    keys.delete(key)
  } else {
    keys.add(key)
  }

  write([...keys])
}

export function clearKnownWords() {
  write([])
}
