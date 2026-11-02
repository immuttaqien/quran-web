import { expect, type Page } from "@playwright/test"
import mock from "./mock-data.cjs"

export const { translationForArabic } = mock

/** Jumlah kata di halaman 1 surah mana pun pada data tiruan (5 ayat x 4 kata). */
export const WORDS_PAGE_1 = 20
/** Halaman 2 memuat 2 ayat sisanya. */
export const WORDS_PAGE_2 = 8
/** Total kata satu surah pada data tiruan (7 ayat x 4 kata). */
export const WORDS_TOTAL = 28

/** Tombol "tandai dikenal" pada kartu kata (bukan tombol audio). */
export function wordCards(page: Page) {
  return page.getByRole("button", { name: /________/ })
}

/** Tandai `count` kata pertama di halaman baca sebagai dikenal. */
export async function markFirstWords(page: Page, count: number) {
  await expect(wordCards(page)).toHaveCount(WORDS_PAGE_1)

  for (let i = 0; i < count; i++) await wordCards(page).nth(i).click()
}

/** Kata Arab yang sedang ditanyakan pada kuis/ulasan. */
export async function currentArabic(page: Page): Promise<string> {
  return ((await page.locator("p.text-6xl").textContent()) ?? "").trim()
}

export async function answerCorrectly(page: Page) {
  const answer = translationForArabic(await currentArabic(page))

  await page.getByRole("button", { name: answer, exact: true }).click()
}

export async function answerWrongly(page: Page) {
  const answer = translationForArabic(await currentArabic(page))
  const options = page.locator("div.grid button")
  const wrong = options.filter({
    hasNotText: new RegExp(`^${escapeRegExp(answer)}$`),
  })

  await wrong.first().click()
}

export function nextQuestion(page: Page) {
  return page.getByRole("button", { name: /Lanjut|Lihat hasil/ }).click()
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Baca nilai JSON dari localStorage halaman. */
export async function readStorage<T>(
  page: Page,
  key: string,
  fallback: T
): Promise<T> {
  const raw = await page.evaluate((k) => localStorage.getItem(k), key)

  return raw === null ? fallback : (JSON.parse(raw) as T)
}

export const KNOWN_KEY = "quran-web:known-words:v2"
export const REVIEW_KEY = "quran-web:review:v1"
