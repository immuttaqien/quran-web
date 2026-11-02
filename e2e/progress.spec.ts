import { readFileSync } from "node:fs"
import { expect, type Page, test } from "@playwright/test"
import { KNOWN_KEY, markFirstWords, REVIEW_KEY, readStorage } from "./helpers"

const counts = (page: Page, known: number, scheduled: number) =>
  expect(
    page.getByText(
      `${known} kata dikenal · ${scheduled} kata terjadwal untuk diulas`
    )
  ).toBeVisible()

const upload = (page: Page, name: string, content: string) =>
  page.locator("input[type=file]").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(content),
  })

async function seed(page: Page, words = 3) {
  await page.goto("/surah/1")
  await markFirstWords(page, words)
  await page.goto("/progress")
  await counts(page, words, words)
}

async function exportBackup(page: Page): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Unduh cadangan" }).click(),
  ])
  const path = await download.path()

  return readFileSync(path, "utf8")
}

const dirtyBackup = JSON.stringify({
  app: "quran-web",
  version: 1,
  knownWords: ["1:1:1", "bad", 5, "2:2:2"],
  reviews: {
    "3:3:3": {
      key: "3:3:3",
      id: 3,
      verseKey: "3:3",
      position: 3,
      arabic: "ك",
      translation: "T",
      box: 2,
      due: 1,
    },
    oops: {},
  },
})

test.describe("ekspor", () => {
  test("mengunduh file berisi progres dengan penanda aplikasi dan versi", async ({
    page,
  }) => {
    await seed(page)

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Unduh cadangan" }).click(),
    ])
    const backup = JSON.parse(readFileSync(await download.path(), "utf8"))

    expect(download.suggestedFilename()).toMatch(
      /^quran-web-progres-\d{4}-\d{2}-\d{2}\.json$/
    )
    expect(backup).toMatchObject({ app: "quran-web", version: 1 })
    expect(backup.knownWords).toHaveLength(3)
    expect(Object.keys(backup.reviews)).toHaveLength(3)
    expect(Number.isNaN(Date.parse(backup.exportedAt))).toBe(false)
    await expect(page.getByText("Cadangan progres diunduh.")).toBeVisible()
  })
})

test.describe("reset", () => {
  test("batal tidak menghapus; konfirmasi menghapus semuanya", async ({
    page,
  }) => {
    await seed(page)

    await page.getByRole("button", { name: "Reset semua progres" }).click()
    await expect(page.getByText("Hapus seluruh progres?")).toBeVisible()
    await page.getByRole("button", { name: "Batal" }).click()
    expect(await readStorage<string[]>(page, KNOWN_KEY, [])).toHaveLength(3)

    await page.getByRole("button", { name: "Reset semua progres" }).click()
    await page.getByRole("button", { name: "Ya, hapus semua" }).click()

    await counts(page, 0, 0)
    await expect(page.getByText("Seluruh progres sudah dihapus.")).toBeVisible()
    expect(await readStorage<string[]>(page, KNOWN_KEY, [])).toEqual([])
    expect(await readStorage(page, REVIEW_KEY, {})).toEqual({})

    await page.goto("/")
    await expect(page.getByText("jatuh tempo untuk diulas")).toHaveCount(0)
  })
})

test.describe("impor", () => {
  test("file rusak ditolak tanpa mengubah data", async ({ page }) => {
    await seed(page)

    await upload(page, "a.json", "bukan json")
    await expect(page.getByText(/bukan JSON yang valid/)).toBeVisible()

    await upload(
      page,
      "b.json",
      JSON.stringify({ app: "lain", version: 1, knownWords: [], reviews: {} })
    )
    await expect(
      page.getByText(/bukan cadangan progres Quran Web/)
    ).toBeVisible()

    await expect(
      page.getByText("Gabungkan dengan progres saat ini")
    ).toHaveCount(0)
    expect(await readStorage<string[]>(page, KNOWN_KEY, [])).toHaveLength(3)
  })

  test("pulihkan hasil ekspor setelah reset (gabungkan), file yang sama bisa dipilih ulang", async ({
    page,
  }) => {
    await seed(page)
    const backup = await exportBackup(page)
    await page.getByRole("button", { name: "Reset semua progres" }).click()
    await page.getByRole("button", { name: "Ya, hapus semua" }).click()
    await counts(page, 0, 0)

    await upload(page, "cadangan.json", backup)
    await expect(
      page.getByText("Berisi 3 kata dikenal dan 3 jadwal ulasan.")
    ).toBeVisible()
    await page.getByRole("button", { name: "Batal" }).click()
    await expect(page.getByText("Berisi 3 kata dikenal")).toHaveCount(0)

    await upload(page, "cadangan.json", backup) // pilih ulang file yang sama
    await page
      .getByRole("button", { name: "Gabungkan dengan progres saat ini" })
      .click()

    await counts(page, 3, 3)
    await page.goto("/")
    await expect(
      page.getByText("3 kata jatuh tempo untuk diulas")
    ).toBeVisible()
  })

  test("file kotor: entri tidak valid dilewati dan dilaporkan", async ({
    page,
  }) => {
    await seed(page)

    await upload(page, "kotor.json", dirtyBackup)

    await expect(
      page.getByText(
        /Berisi 2 kata dikenal dan 1 jadwal ulasan\. 3 entri tidak valid dilewati\./
      )
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Gabungkan dengan progres saat ini" })
      .click()
    // 1:1:1 sudah ada, jadi hanya 2:2:2 yang bertambah: 4 dikenal, 3 + 1 jadwal.
    await counts(page, 4, 4)
  })

  test("timpa meminta konfirmasi dan hanya menyisakan isi file", async ({
    page,
  }) => {
    await seed(page)
    const backup = await exportBackup(page)
    await upload(page, "kotor.json", dirtyBackup)
    await page
      .getByRole("button", { name: "Gabungkan dengan progres saat ini" })
      .click()
    await counts(page, 4, 4)

    await upload(page, "cadangan.json", backup)
    await page.getByRole("button", { name: "Timpa progres saat ini" }).click()
    await expect(page.getByText("Timpa progres saat ini?")).toBeVisible()
    await page.getByRole("button", { name: "Batal" }).last().click()
    expect(await readStorage<string[]>(page, KNOWN_KEY, [])).toHaveLength(4)

    await page.getByRole("button", { name: "Timpa progres saat ini" }).click()
    await page.getByRole("button", { name: "Ya, timpa" }).click()

    await counts(page, 3, 3)
    await page.reload()
    await counts(page, 3, 3)
  })
})
