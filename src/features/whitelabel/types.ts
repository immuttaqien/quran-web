import type { Theme } from "@/types/theme"

export type WhitelabelModel = {
  id: string
  name: string
  domain: string
  email: string
  phone: string
  address: string
  theme: Theme
}
