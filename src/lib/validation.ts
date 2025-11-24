import { z } from "zod/v4"

const pathnameRegex = /^\/[a-zA-Z0-9\-/_?=&]*$/

export const pathnameSchema = z.string().regex(pathnameRegex, {
  message: "Invalid pathname format",
})

export const phoneNumberSchema = z.string().regex(/^08\d*$/, {
  message: "Invalid phone number format",
})
