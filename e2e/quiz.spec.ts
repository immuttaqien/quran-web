import { expect, test } from "@playwright/test"
import {
  answerCorrectly,
  answerWrongly,
  currentArabic,
  nextQuestion,
  translationForArabic,
  WORDS_PAGE_2,
} from "./helpers"

test.describe("kuis halaman", () => {
  test("dapat dibuka dari halaman baca", async ({ page }) => {
    await page.goto("/surah/1?page=2")

    await page.getByRole("link", { name: "Kuis halaman ini" }).click()

    await expect(page).toHaveURL(/\/surah\/1\/quiz\?page=2/)
    await expect(page.getByText(`Soal 1 dari ${WORDS_PAGE_2}`)).toBeVisible()
  })

  test("opsi unik, berisi jawaban benar, dan terkunci setelah menjawab", async ({
    page,
  }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()

    const options = page.locator("div.grid button")
    const labels = await options.allTextContents()
    expect(labels.length).toBeGreaterThanOrEqual(2)
    expect(new Set(labels).size).toBe(labels.length)
    expect(labels).toContain(translationForArabic(await currentArabic(page)))

    await answerCorrectly(page)

    await expect(page.getByText("Benar!")).toBeVisible()
    for (const option of await options.all())
      await expect(option).toBeDisabled()
  })

  test("jawaban salah menampilkan jawaban yang benar", async ({ page }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()
    const answer = translationForArabic(await currentArabic(page))

    await answerWrongly(page)

    await expect(
      page.getByText(`Kurang tepat. Jawabannya: ${answer}`)
    ).toBeVisible()
  })

  test("semua benar: skor penuh dan kata ditandai dikenal", async ({
    page,
  }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()

    for (let i = 0; i < WORDS_PAGE_2; i++) {
      await answerCorrectly(page)
      await nextQuestion(page)
    }

    await expect(
      page.getByText(`Benar ${WORDS_PAGE_2} dari ${WORDS_PAGE_2} soal`)
    ).toBeVisible()

    await page.getByRole("link", { name: "Kembali membaca" }).first().click()
    await expect(
      page.getByText(`${WORDS_PAGE_2} dari ${WORDS_PAGE_2} kata di halaman ini`)
    ).toBeVisible()
  })

  test("ulangi yang salah hanya memuat soal yang salah", async ({ page }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()

    await answerWrongly(page)
    await nextQuestion(page)
    for (let i = 1; i < WORDS_PAGE_2; i++) {
      await answerCorrectly(page)
      await nextQuestion(page)
    }
    await expect(
      page.getByText(`Benar ${WORDS_PAGE_2 - 1} dari ${WORDS_PAGE_2} soal`)
    ).toBeVisible()

    await page.getByRole("button", { name: "Ulangi yang salah" }).click()

    await expect(page.getByText("Soal 1 dari 1")).toBeVisible()
    await expect(page.getByRole("button", { name: "Kuis lagi" })).toHaveCount(0)
  })

  test("kuis lagi mengulang dari awal", async ({ page }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()
    for (let i = 0; i < WORDS_PAGE_2; i++) {
      await answerCorrectly(page)
      await nextQuestion(page)
    }

    await page.getByRole("button", { name: "Kuis lagi" }).click()

    await expect(page.getByText(`Soal 1 dari ${WORDS_PAGE_2}`)).toBeVisible()
  })
})
