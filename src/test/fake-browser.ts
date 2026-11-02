/**
 * `window` + localStorage palsu untuk menguji modul yang hanya jalan di
 * browser (store, hook) tanpa DOM sungguhan.
 */

export interface FakeBrowser {
  /** Isi localStorage palsu. */
  storage: Map<string, string>
  /** Simulasikan localStorage yang diblokir (mode privat, kuota penuh). */
  setBlocked(blocked: boolean): void
  uninstall(): void
}

export function installFakeBrowser(): FakeBrowser {
  const storage = new Map<string, string>()
  const listeners = new Map<string, Set<() => void>>()
  let blocked = false

  const localStorage = {
    getItem(key: string) {
      if (blocked) throw new Error("localStorage diblokir")
      return storage.get(key) ?? null
    },
    setItem(key: string, value: string) {
      if (blocked) throw new Error("localStorage diblokir")
      storage.set(key, value)
    },
  }

  const fakeWindow = {
    localStorage,
    addEventListener(type: string, listener: () => void) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)?.add(listener)
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener)
    },
    dispatchEvent(event: Event) {
      for (const listener of listeners.get(event.type) ?? []) listener()
      return true
    },
  }

  Object.assign(globalThis, { window: fakeWindow })

  return {
    storage,
    setBlocked(value) {
      blocked = value
    },
    uninstall() {
      delete (globalThis as { window?: unknown }).window
    },
  }
}
