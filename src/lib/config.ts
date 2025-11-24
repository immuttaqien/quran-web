import { cookies } from "next/headers"

import constant from "@/data/constant"
import cookie from "@/data/cookie"

import { parseIntOrDefault } from "./utils"
import { getWhitelabel } from "./whitelabel"

export async function getPageSize() {
  const cookieStore = await cookies()

  const { data: whitelabel } = await getWhitelabel()

  return parseIntOrDefault(
    cookieStore.get(
      cookie.PAGE_SIZE(
        whitelabel?.name.split(" ").join("_").toLowerCase() || constant.PREFIX
      )
    )?.value,
    10
  )
}
