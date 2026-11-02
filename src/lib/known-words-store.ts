/**
 * Penyimpanan progres kata yang sudah dikenal di localStorage.
 *
 * Disimpan sebagai string JSON (array id kata) agar bisa dipakai langsung
 * sebagai snapshot yang stabil oleh useSyncExternalStore. Bila localStorage
 * tidak tersedia (mode privat, diblokir), progres tetap tersimpan di memori
 * selama halaman terbuka.
 */

export const STORAGE_KEY = "quran-web:known-words:v1"
export const CHANGE_EVENT = "quran-web:known-words-change"
export const EMPTY_SNAPSHOT = "[]"

let memorySnapshot = EMPTY_SNAPSHOT

export function parseKnownIds(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((id): id is number => Number.isInteger(id))
  } catch {
    return []
  }
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

function write(ids: number[]) {
  const raw = JSON.stringify(ids)
  memorySnapshot = raw

  try {
    window.localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // Penyimpanan penuh atau diblokir: pakai memori saja.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Tandai atau batalkan tanda sebuah kata. Selalu membaca nilai terbaru dari storage. */
export function toggleKnownWord(id: number) {
  const ids = new Set(parseKnownIds(getSnapshot()))

  if (ids.has(id)) {
    ids.delete(id)
  } else {
    ids.add(id)
  }

  write([...ids])
}

export function clearKnownWords() {
  write([])
}
