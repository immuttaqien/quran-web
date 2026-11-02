import { describe, expect, test } from "bun:test"
import { isNavItemActive, NAV_ITEMS } from "./nav-items"

const [surah, review, progress] = NAV_ITEMS

describe("NAV_ITEMS", () => {
  test("hanya tujuan nyata, tanpa placeholder", () => {
    expect(NAV_ITEMS.map((item) => item.href)).toEqual([
      "/",
      "/review",
      "/progress",
    ])
    expect(NAV_ITEMS.some((item) => item.href === "#")).toBe(false)
    expect(new Set(NAV_ITEMS.map((item) => item.title)).size).toBe(
      NAV_ITEMS.length
    )
  })
})

describe("isNavItemActive", () => {
  test("beranda hanya aktif di '/', dan di halaman surah", () => {
    expect(isNavItemActive(surah, "/")).toBe(true)
    expect(isNavItemActive(surah, "/surah/1")).toBe(true)
    expect(isNavItemActive(surah, "/surah/1/quiz")).toBe(true)
    expect(isNavItemActive(surah, "/review")).toBe(false)
    expect(isNavItemActive(surah, "/progress")).toBe(false)
  })

  test("cocok per segmen, bukan awalan teks", () => {
    expect(isNavItemActive(review, "/review")).toBe(true)
    expect(isNavItemActive(review, "/review/")).toBe(true) // garis miring akhir ditoleransi
    expect(isNavItemActive(review, "/reviews")).toBe(false)
    expect(isNavItemActive(review, "/reviewx/1")).toBe(false)
    expect(isNavItemActive(surah, "/surahs")).toBe(false)
  })

  test("hanya satu item yang aktif pada satu rute", () => {
    for (const path of ["/", "/surah/2", "/review", "/progress"]) {
      expect(
        NAV_ITEMS.filter((item) => isNavItemActive(item, path))
      ).toHaveLength(1)
    }
    expect(isNavItemActive(progress, "/progress")).toBe(true)
  })

  test("rute tak dikenal tidak mengaktifkan apa pun", () => {
    expect(NAV_ITEMS.some((item) => isNavItemActive(item, "/login"))).toBe(
      false
    )
  })
})
