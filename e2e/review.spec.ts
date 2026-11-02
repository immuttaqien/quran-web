import { expect, test } from "@playwright/test"
import {
  answerCorrectly,
  answerWrongly,
  markFirstWords,
  nextQuestion,
  REVIEW_KEY,
  readStorage,
} from "./helpers"

type Cards = Record<string, { box: number; due: number }>

test.describe("pengulangan berjarak", () => {
  test("kosong: belum ada kata terjadwal dan tanpa banner", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByText("jatuh tempo untuk diulas")).toHaveCount(0)

    await page.goto("/review")

    await expect(
      page.getByText("Belum ada kata yang dijadwalkan")
    ).toBeVisible()
  })

  test("menandai kata menjadwalkan ulasan yang langsung jatuh tempo", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    expect(
      Object.keys(await readStorage<Cards>(page, REVIEW_KEY, {}))
    ).toHaveLength(3)

    await page.goto("/")
    await expect(
      page.getByText("3 kata jatuh tempo untuk diulas")
    ).toBeVisible()
  })

  test("sesi ulasan memperbarui jadwal; ulangi yang salah menaikkannya", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    await page.goto("/")
    await page.getByText("Buka ulasan").click()
    await expect(page).toHaveURL(/\/review$/)
    await expect(page.getByText("Soal 1 dari 3")).toBeVisible()

    await answerCorrectly(page)
    await nextQuestion(page)
    await answerCorrectly(page)
    await nextQuestion(page)
    await answerWrongly(page)
    await expect(page.getByText(/Kurang tepat/)).toBeVisible()
    await nextQuestion(page)

    await expect(page.getByText("Benar 2 dari 3 soal")).toBeVisible()
    await expect(
      page.getByText("3 kata terjadwal, tidak ada yang jatuh tempo sekarang")
    ).toBeVisible()
    await expect(
      page.getByText(/Ulasan berikutnya dalam kurang dari 1 jam/)
    ).toBeVisible()
    await expect(page.getByRole("button", { name: "Kuis lagi" })).toHaveCount(0)

    const boxes = Object.values(await readStorage<Cards>(page, REVIEW_KEY, {}))
      .map((card) => card.box)
      .sort()
    expect(boxes).toEqual([0, 1, 1])

    await page.getByRole("button", { name: "Ulangi yang salah" }).click()
    await expect(page.getByText("Soal 1 dari 1")).toBeVisible()
    await answerCorrectly(page)
    await nextQuestion(page)

    await expect(page.getByText("Benar 1 dari 1 soal")).toBeVisible()
    const after = Object.values(await readStorage<Cards>(page, REVIEW_KEY, {}))
    expect(after.map((card) => card.box)).toEqual([1, 1, 1])
  })

  test("setelah sesi tidak ada yang jatuh tempo, jeda berikutnya 1 hari", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 2)
    await page.goto("/review")
    await expect(page.getByText("Soal 1 dari 2")).toBeVisible()
    for (let i = 0; i < 2; i++) {
      await answerCorrectly(page)
      await nextQuestion(page)
    }

    await page.reload()

    await expect(
      page.getByText(
        /2 kata terjadwal, tidak ada yang jatuh tempo sekarang\. Ulasan berikutnya dalam 1 hari/
      )
    ).toBeVisible()
  })

  test("membatalkan tanda dikenal mengeluarkan kata dari jadwal", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    await page
      .getByRole("button", { name: /________/ })
      .first()
      .click()

    expect(
      Object.keys(await readStorage<Cards>(page, REVIEW_KEY, {}))
    ).toHaveLength(2)
  })

  test("waktu berjalan: kata jatuh tempo muncul lagi di sesi ulasan", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 2)
    await page.evaluate((key) => {
      const cards = JSON.parse(localStorage.getItem(key) ?? "{}")
      for (const card of Object.values<{ due: number }>(cards)) card.due = 0
      localStorage.setItem(key, JSON.stringify(cards))
    }, REVIEW_KEY)

    await page.goto("/")
    await expect(
      page.getByText("2 kata jatuh tempo untuk diulas")
    ).toBeVisible()

    await page.goto("/review")
    await expect(page.getByText("Soal 1 dari 2")).toBeVisible()
    // Pengecoh hanya dari kumpulan kecil: tersisa 2 opsi.
    await expect(page.locator("div.grid button")).toHaveCount(2)
  })

  test("kuis halaman mencatat jadwal untuk semua kata yang dijawab", async ({
    page,
  }) => {
    await page.goto("/surah/1/quiz?page=2")
    await expect(page.getByText(/Soal 1 dari/)).toBeVisible()

    for (let i = 0; i < 8; i++) {
      await answerCorrectly(page)
      await nextQuestion(page)
    }

    const cards = Object.values(await readStorage<Cards>(page, REVIEW_KEY, {}))
    expect(cards).toHaveLength(8)
    expect(cards.every((card) => card.box === 1)).toBe(true)
  })
})
