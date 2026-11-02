import { expect, type Page, test } from "@playwright/test"
import { markFirstWords } from "./helpers"

const sidebar = (page: Page) => page.locator("[data-slot=sidebar]")
const navLink = (page: Page, name: string | RegExp) =>
  sidebar(page).getByRole("link", { name })
/** Item sidebar yang sedang aktif (shadcn menandainya dengan data-active). */
const activeItems = (page: Page) =>
  sidebar(page).locator("[data-slot=sidebar-menu-button][data-active=true]")

test.describe("sidebar", () => {
  test("hanya berisi tujuan nyata, tanpa sisa template", async ({ page }) => {
    await page.goto("/")

    await expect(navLink(page, "Quran Web")).toHaveAttribute("href", "/")
    await expect(navLink(page, "Daftar Surah")).toHaveAttribute("href", "/")
    await expect(navLink(page, /^Ulasan/)).toHaveAttribute("href", "/review")
    await expect(navLink(page, "Data progres")).toHaveAttribute(
      "href",
      "/progress"
    )

    for (const leftover of [
      "Dashboard",
      "Lifecycle",
      "Analytics",
      "Projects",
      "Team",
      "Capture",
      "Proposal",
      "Prompts",
      "Data Library",
      "Reports",
      "Word Assistant",
      "Settings",
      "Get Help",
      "Search",
      "Inbox",
      "shadcn",
    ]) {
      await expect(
        sidebar(page).getByText(leftover, { exact: true })
      ).toHaveCount(0)
    }
    // Tidak ada tautan mati ("#") di sidebar.
    await expect(sidebar(page).locator("a[href='#']")).toHaveCount(0)
  })

  test("tidak meminta avatar template yang tidak ada", async ({ page }) => {
    const missing: string[] = []
    page.on("response", (response) => {
      if (response.status() === 404) missing.push(response.url())
    })

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    expect(missing.filter((url) => url.includes("/avatars/"))).toEqual([])
  })

  test("berpindah halaman dan menandai item yang aktif", async ({ page }) => {
    await page.goto("/")
    await expect(activeItems(page)).toHaveCount(1)
    await expect(activeItems(page)).toHaveText(/Daftar Surah/)

    await navLink(page, /^Ulasan/).click()
    await expect(page).toHaveURL(/\/review$/)
    await expect(activeItems(page)).toHaveCount(1)
    await expect(activeItems(page)).toHaveText(/Ulasan/)

    await navLink(page, "Data progres").click()
    await expect(page).toHaveURL(/\/progress$/)
    await expect(activeItems(page)).toHaveText(/Data progres/)

    await navLink(page, "Daftar Surah").click()
    await expect(page).toHaveURL(/\/$/)
    await expect(activeItems(page)).toHaveText(/Daftar Surah/)
  })

  test("halaman surah dan kuis tetap menandai Daftar Surah", async ({
    page,
  }) => {
    for (const path of ["/surah/1", "/surah/1/quiz?page=2"]) {
      await page.goto(path)

      await expect(activeItems(page)).toHaveCount(1)
      await expect(activeItems(page)).toHaveText(/Daftar Surah/)
    }
  })

  test("lencana Ulasan menampilkan jumlah kata jatuh tempo", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(navLink(page, /^Ulasan/)).toHaveAccessibleName("Ulasan")

    await page.goto("/surah/1")
    await markFirstWords(page, 3)

    await expect(navLink(page, /Ulasan/)).toHaveAccessibleName(
      "Ulasan 3 kata jatuh tempo"
    )
  })
})

test.describe("breadcrumb", () => {
  test("beranda, ulasan, dan progres menampilkan halaman aktif", async ({
    page,
  }) => {
    const crumb = (name: string) =>
      page.locator("header").getByText(name, { exact: true })

    for (const [path, label] of [
      ["/", "Daftar Surah"],
      ["/review", "Ulasan"],
      ["/progress", "Data progres"],
    ] as const) {
      await page.goto(path)

      await expect(crumb(label)).toHaveAttribute("aria-current", "page")
    }
  })

  test("halaman surah: Daftar Surah › nama surah, dan tautannya bekerja", async ({
    page,
  }) => {
    await page.goto("/surah/2")
    const header = page.locator("header")

    await expect(header.getByText("Surah-2", { exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    )

    await header.getByRole("link", { name: "Daftar Surah" }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test("halaman kuis: tautan surah membawa kembali ke halaman yang sama", async ({
    page,
  }) => {
    await page.goto("/surah/1/quiz?page=2")
    const header = page.locator("header")

    await expect(header.getByText("Kuis", { exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    )

    await header.getByRole("link", { name: "Surah-1" }).click()

    await expect(page).toHaveURL(/\/surah\/1\?page=2$/)
  })

  test("header tidak lagi memuat lonceng notifikasi kosong", async ({
    page,
  }) => {
    await page.goto("/")

    await expect(
      page
        .locator("header button")
        .filter({ has: page.locator("svg.lucide-bell") })
    ).toHaveCount(0)
    await expect(page.getByText("Tidak ada notifikasi baru")).toHaveCount(0)
  })
})

test.describe("layar kecil", () => {
  test.use({ viewport: { width: 390, height: 800 } })

  test("sidebar tersembunyi, terbuka lewat tombol, dan menutup setelah berpindah", async ({
    page,
  }) => {
    await page.goto("/")
    // Eksak: tautan "Kelola data progres" di halaman utama bukan item sidebar.
    await expect(
      page.getByRole("link", { name: "Data progres", exact: true })
    ).toHaveCount(0)

    await page.getByRole("button", { name: "Toggle Sidebar" }).click()
    const dialog = page.getByRole("dialog")
    await expect(
      dialog.getByRole("link", { name: "Data progres", exact: true })
    ).toBeVisible()

    await dialog
      .getByRole("link", { name: "Data progres", exact: true })
      .click()

    await expect(page).toHaveURL(/\/progress$/)
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})
