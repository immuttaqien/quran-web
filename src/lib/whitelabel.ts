import { headers } from "next/headers"

import type { WhitelabelModel } from "@/features/whitelabel/types"

export async function getWhitelabel(): Promise<{
  data: WhitelabelModel | null
}> {
  const heads = await headers()

  const data = heads.get("x-whitelabel")

  return { data: data ? JSON.parse(data) : null }
}
