import { CheckCircle2Icon } from "lucide-react"

interface SuccessToastProps {
  id: string | number
  message?: string
}

export default function SuccessToast({ message }: SuccessToastProps) {
  return (
    <div className="w-full rounded-md border border-emerald-500 bg-emerald-500 px-4 pt-3 pb-3 shadow-lg sm:w-[var(--width)]">
      <div className="flex gap-2">
        <div className="flex grow items-center gap-3">
          <CheckCircle2Icon
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-white"
            size={16}
          />
          <div className="flex grow justify-between gap-12">
            <p className="text-sm text-white">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
