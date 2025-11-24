"use client"

import { ProgressProvider } from "@bprogress/next/app"

export default function BProgressProvider({
  children,
}: React.PropsWithChildren) {
  return (
    <ProgressProvider
      options={{ showSpinner: false, template: null }}
      shallowRouting>
      {children}
    </ProgressProvider>
  )
}
