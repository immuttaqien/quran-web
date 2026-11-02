import { expect, type Page, test } from "@playwright/test"
import { currentArabic, markFirstWords, WORDS_PAGE_1 } from "./helpers"
import mock from "./mock-data.cjs"

const CDN = "https://audio.qurancdn.com/"

/** WAV senyap 3 detik (8 kHz, 8-bit mono) agar status "diputar" bisa diamati. */
function silentWav() {
  const samples = 8000 * 3
  const header = Buffer.alloc(44)
  header.write("RIFF", 0)
  header.writeUInt32LE(36 + samples, 4)
  header.write("WAVEfmt ", 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(8000, 24)
  header.writeUInt32LE(8000, 28)
  header.writeUInt16LE(1, 32)
  header.writeUInt16LE(8, 34)
  header.write("data", 36)
  header.writeUInt32LE(samples, 40)

  return Buffer.concat([header, Buffer.alloc(samples, 0x80)])
}

/** Cegat CDN audio: semua berhasil kecuali URL di `failing`. Mengembalikan daftar URL yang diminta. */
async function stubAudio(page: Page, failing: string[] = []) {
  const requested: string[] = []
  const wav = silentWav()

  await page.route(`${CDN}**`, (route) => {
    const url = route.request().url()
    requested.push(url)

    if (failing.some((suffix) => url.endsWith(suffix))) return route.abort()

    return route.fulfill({ status: 200, contentType: "audio/wav", body: wav })
  })

  return requested
}

/** Catat setiap `new Audio()` agar status jeda/berhenti dapat diperiksa. */
async function trackAudioElements(page: Page) {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio
    const tracked: HTMLAudioElement[] = []
    ;(window as unknown as { __audios: HTMLAudioElement[] }).__audios = tracked
    // Harus `function` biasa: kode aplikasi memanggilnya dengan `new Audio()`,
    // dan fungsi panah tidak bisa dipanggil dengan `new`.
    // biome-ignore lint/complexity/useArrowFunction: lihat komentar di atas
    window.Audio = function (...args: ConstructorParameters<typeof Audio>) {
      const audio = new NativeAudio(...args)
      tracked.push(audio)
      return audio
    } as unknown as typeof Audio
  })
}

const playingCount = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __audios: HTMLAudioElement[] }).__audios.filter(
        (audio) => !audio.paused && !audio.error
      ).length
  )

const audioButtons = (page: Page) =>
  page.getByRole("button", { name: /audio/i })
const pressed = (page: Page) => page.locator("button[aria-pressed=true]")

test.describe("audio per kata", () => {
  test("setiap kata punya tombol audio terpisah dari tombol tandai", async ({
    page,
  }) => {
    await page.goto("/surah/1")

    await expect(audioButtons(page)).toHaveCount(WORDS_PAGE_1)
    await expect(page.locator("button button")).toHaveCount(0)
  })

  test("memutar kata dengan URL yang sesuai tanpa menandainya dikenal; klik lagi berhenti", async ({
    page,
  }) => {
    await trackAudioElements(page)
    const requested = await stubAudio(page)
    await page.goto("/surah/1")

    await audioButtons(page).nth(0).click()

    await expect(pressed(page)).toHaveCount(1)
    expect(requested.at(-1)).toBe(`${CDN}wbw/001_001_001.mp3`)
    await expect(audioButtons(page).nth(0)).toHaveAccessibleName(
      "Hentikan audio kata"
    )
    await expect(
      page.getByText(`0 dari ${WORDS_PAGE_1} kata di halaman ini`)
    ).toBeVisible()

    await pressed(page).click()

    await expect(pressed(page)).toHaveCount(0)
    expect(await playingCount(page)).toBe(0)
  })

  test("gagal dimuat: tampil status gagal, hilang saat memutar kata lain", async ({
    page,
  }) => {
    await trackAudioElements(page)
    await stubAudio(page, ["001_001_002.mp3"])
    await page.goto("/surah/1")

    await audioButtons(page).nth(1).click()

    const failed = page.getByRole("button", {
      name: "Audio tidak tersedia, coba lagi",
    })
    await expect(failed).toBeVisible()

    await audioButtons(page).nth(2).click()

    await expect(pressed(page)).toHaveCount(1)
    await expect(failed).toHaveCount(0)
  })

  test("hanya satu kata yang diputar pada satu waktu", async ({ page }) => {
    await trackAudioElements(page)
    await stubAudio(page)
    await page.goto("/surah/1")

    await audioButtons(page).nth(0).click()
    await expect(pressed(page)).toHaveCount(1)
    await audioButtons(page).nth(3).click()

    await expect(pressed(page)).toHaveCount(1)
    await expect(audioButtons(page).nth(0)).toHaveAccessibleName(
      "Putar audio kata"
    )
    expect(await playingCount(page)).toBe(1)
  })

  test("pindah halaman menghentikan suara", async ({ page }) => {
    await trackAudioElements(page)
    await stubAudio(page)
    await page.goto("/surah/1")
    await audioButtons(page).nth(0).click()
    await expect(pressed(page)).toHaveCount(1)

    await page.getByRole("link", { name: /← Daftar Surah/ }).click()

    await expect(page).toHaveURL(/\/$/)
    expect(await playingCount(page)).toBe(0)
  })

  test("kuis: tombol audio memutar kata yang sedang ditanyakan", async ({
    page,
  }) => {
    const requested = await stubAudio(page)
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()
    const { verse, position } = mock.locate(await currentArabic(page))
    const pad = (n: number) => String(n).padStart(3, "0")

    await page.getByRole("button", { name: "Putar audio kata" }).click()

    await expect(pressed(page)).toHaveCount(1)
    expect(requested.at(-1)).toBe(
      `${CDN}wbw/001_${pad(verse)}_${pad(position)}.mp3`
    )
    // Memutar audio tidak ikut menjawab soal.
    await expect(page.locator("div.grid button:disabled")).toHaveCount(0)
  })

  test("ulasan: kata dari penyimpanan lokal tetap bisa diputar", async ({
    page,
  }) => {
    const requested = await stubAudio(page)
    await page.goto("/surah/1")
    await markFirstWords(page, 3)
    await page.goto("/review")
    await expect(page.getByText("Soal 1 dari 3")).toBeVisible()
    const { verse, position } = mock.locate(await currentArabic(page))
    const pad = (n: number) => String(n).padStart(3, "0")

    await page.getByRole("button", { name: "Putar audio kata" }).click()

    await expect(pressed(page)).toHaveCount(1)
    expect(requested.at(-1)).toBe(
      `${CDN}wbw/001_${pad(verse)}_${pad(position)}.mp3`
    )
  })
})
