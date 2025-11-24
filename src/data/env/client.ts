import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod/v4"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_NODE_ENV: z.enum(["development", "production", "test"]),

    // API URLs
    NEXT_PUBLIC_API_URL: z.url().refine((url) => !url.endsWith("/"), {
      message: "NEXT_PUBLIC_API_URL must not end with a slash",
    }),

    // Google OAuth
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().nonempty(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,

    // API URLs
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

    // Google OAuth
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
})
