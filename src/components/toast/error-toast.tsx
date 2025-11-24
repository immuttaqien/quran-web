import { AlertCircleIcon } from "lucide-react"

interface ErrorToastProps {
  id: string | number
  message?: string
}

export default function ErrorToast({ message }: ErrorToastProps) {
  return (
    <div className="w-full rounded-md border border-destructive bg-destructive px-4 pt-3 pb-3 text-background shadow-lg sm:w-[var(--width)]">
      <div className="flex gap-2">
        <div className="flex grow items-center gap-3">
          <AlertCircleIcon
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-background"
            size={16}
          />
          <div className="flex grow justify-between gap-12">
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
