import { describe, expect, test } from "bun:test"
import { WORD_AUDIO_BASE_URL, wordAudioUrl } from "@/lib/word-audio"

describe("wordAudioUrl", () => {
  test("mengisi nol di depan menjadi 3 digit", () => {
    expect(wordAudioUrl("1:1", 1)).toBe(
      "https://audio.qurancdn.com/wbw/001_001_001.mp3"
    )
    expect(wordAudioUrl("2:255", 3)).toBe(
      "https://audio.qurancdn.com/wbw/002_255_003.mp3"
    )
    expect(wordAudioUrl("114:6", 12)).toBe(
      "https://audio.qurancdn.com/wbw/114_006_012.mp3"
    )
  })

  test("alamat dasar diakhiri garis miring", () => {
    expect(WORD_AUDIO_BASE_URL.endsWith("/")).toBe(true)
  })

  test.each([
    ["x:1", 1],
    ["1", 1],
    ["", 1],
    ["0:1", 1],
    ["1:0", 1],
    ["1:1", 0],
    ["1:1", 1.5],
  ])("menolak lokasi tidak valid %s #%d", (verseKey, position) => {
    expect(() => wordAudioUrl(verseKey, position)).toThrow("tidak valid")
  })
})
