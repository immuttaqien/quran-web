import { expect, test } from "@playwright/test"
import {
  KNOWN_KEY,
  markFirstWords,
  readStorage,
  WORDS_PAGE_1,
  WORDS_PAGE_2,
  WORDS_TOTAL,
} from "./helpers"

test.describe("daftar surah", () => {
  test("menampilkan surah dan belum ada progres", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText("3 surah")).toBeVisible()
    await expect(page.getByText("0 kata dikenal").first()).toBeVisible()
    await expect(page.getByText("jatuh tempo untuk diulas")).toHaveCount(0)
    await expect(page.getByRole("link", { name: /Surah-2/ })).toBeVisible()
  })
})

test.describe("membaca surah", () => {
  test("menampilkan kata per halaman dan statistik awal", async ({ page }) => {
    await page.goto("/surah/1")

    await expect(
      page.getByRole("heading", { name: "Surah-1 (1)" })
    ).toBeVisible()
    await expect(
      page.getByText(`0 / ${WORDS_TOTAL} kata dikenal (0%)`)
    ).toBeVisible()
    await expect(
      page.getByText(`0 dari ${WORDS_PAGE_1} kata di halaman ini`)
    ).toBeVisible()
  })

  test("menandai kata memperbarui hitungan dan bertahan setelah muat ulang", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    await expect(
      page.getByText(`3 dari ${WORDS_PAGE_1} kata di halaman ini`)
    ).toBeVisible()
    await expect(
      page.getByText(`3 / ${WORDS_TOTAL} kata dikenal (11%)`)
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByText(`3 / ${WORDS_TOTAL} kata dikenal (11%)`)
    ).toBeVisible()
    expect(await readStorage<string[]>(page, KNOWN_KEY, [])).toHaveLength(3)
  })

  test("membatalkan tanda mengurangi hitungan", async ({ page }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 2)
    await expect(page.getByText(`2 / ${WORDS_TOTAL}`)).toBeVisible()

    await page
      .getByRole("button", { name: /________/ })
      .first()
      .click()

    await expect(page.getByText(`1 / ${WORDS_TOTAL}`)).toBeVisible()
  })

  test("halaman 2 memuat sisa kata dengan total surah yang sama", async ({
    page,
  }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 1)

    await page.getByRole("link", { name: "Next" }).click()

    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole("button", { name: /________/ })).toHaveCount(
      WORDS_PAGE_2
    )
    await expect(page.getByText(`1 / ${WORDS_TOTAL}`)).toBeVisible()
    await expect(page.getByText("Next").last()).toHaveClass(/opacity-50/)
  })

  test("progres tampil di daftar surah", async ({ page }) => {
    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    await page.getByRole("link", { name: /Daftar Surah/ }).click()

    await expect(page.getByText("3 kata dikenal").first()).toBeVisible()
    await expect(
      page.getByText("3 kata jatuh tempo untuk diulas")
    ).toBeVisible()
  })

  test("nomor surah di luar 1–114 menghasilkan 404", async ({ page }) => {
    for (const id of ["0", "115", "abc"]) {
      const response = await page.goto(`/surah/${id}`)

      expect(response?.status(), `/surah/${id}`).toBe(404)
    }
  })
})
