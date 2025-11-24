"use server"

import { cookies } from "next/headers"

import constant from "@/data/constant"
import cookie from "@/data/cookie"
import { getWhitelabel } from "@/lib/whitelabel"

export async function setPageSize(size: number) {
  const { data: whitelabel } = await getWhitelabel()
  const cookieStore = await cookies()

  cookieStore.set(
    cookie.PAGE_SIZE(
      whitelabel?.name.split(" ").join("_").toLowerCase() || constant.PREFIX
    ),
    `${size}`
  )
}
