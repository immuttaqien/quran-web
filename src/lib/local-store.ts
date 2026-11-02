/**
 * Store kecil berbasis localStorage untuk useSyncExternalStore.
 *
 * Nilai disimpan sebagai satu string (snapshot yang stabil). Bila localStorage
 * tidak tersedia (mode privat, diblokir, penuh), nilai tetap disimpan di memori
 * selama halaman terbuka.
 */
export function createLocalStore(storageKey: string, empty: string) {
  const changeEvent = `${storageKey}:change`
  let memorySnapshot = empty

  return {
    getSnapshot(): string {
      try {
        return window.localStorage.getItem(storageKey) ?? empty
      } catch {
        return memorySnapshot
      }
    },

    getServerSnapshot(): string {
      return empty
    },

    subscribe(onChange: () => void): () => void {
      window.addEventListener("storage", onChange)
      window.addEventListener(changeEvent, onChange)

      return () => {
        window.removeEventListener("storage", onChange)
        window.removeEventListener(changeEvent, onChange)
      }
    },

    write(raw: string) {
      memorySnapshot = raw

      try {
        window.localStorage.setItem(storageKey, raw)
      } catch {
        // Penyimpanan penuh atau diblokir: pakai memori saja.
      }

      window.dispatchEvent(new Event(changeEvent))
    },
  }
}
