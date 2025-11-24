import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod/v4"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),

    // BETTERSTACK_API_KEY: z.string().nonempty(),
    // BETTERSTACK_ENDPOINT: z.url().refine((url) => !url.endsWith("/"), {
    //   message: "BETTERSTACK_ENDPOINT must not end with a slash",
    // }),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
})
