"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { wordKey } from "@/lib/known-words-store"
import { wordAudioUrl } from "@/lib/word-audio"

interface Active {
  key: string
  audio: HTMLAudioElement
}

/**
 * Pemutar audio kata. Hanya satu kata yang diputar pada satu waktu: memutar
 * kata lain menghentikan yang sebelumnya, dan menekan kata yang sedang
 * diputar menghentikannya.
 */
export default function useWordAudio() {
  const activeRef = useRef<Active | null>(null)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)

  const stop = useCallback(() => {
    activeRef.current?.audio.pause()
    activeRef.current = null
    setPlayingKey(null)
  }, [])

  // Hentikan suara saat komponen dilepas (pindah halaman).
  useEffect(() => {
    return () => {
      activeRef.current?.audio.pause()
      activeRef.current = null
    }
  }, [])

  const toggle = useCallback(
    (verseKey: string, position: number) => {
      const key = wordKey(verseKey, position)
      const wasPlaying = activeRef.current?.key === key

      stop()
      setFailedKey(null)
      if (wasPlaying) return

      const audio = new Audio(wordAudioUrl(verseKey, position))
      const active = { key, audio }
      activeRef.current = active

      // Abaikan kejadian dari audio lama yang sudah digantikan atau dihentikan.
      const isCurrent = () => activeRef.current === active

      const fail = () => {
        if (!isCurrent()) return
        activeRef.current = null
        setPlayingKey(null)
        setFailedKey(key)
      }

      audio.addEventListener("playing", () => {
        if (isCurrent()) setPlayingKey(key)
      })
      audio.addEventListener("ended", () => {
        if (!isCurrent()) return
        activeRef.current = null
        setPlayingKey(null)
      })
      audio.addEventListener("error", fail)
      audio.play().catch(fail)
    },
    [stop]
  )

  return { playingKey, failedKey, toggle }
}
