"use client"

import { Bar, Progress } from "@bprogress/next"

export default function PageProgress() {
  return (
    <div className="fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden">
      <Progress>
        <Bar className="!bg-primary !absolute !top-0 !z-[9999] !h-0.5" />
      </Progress>
    </div>
  )
}
