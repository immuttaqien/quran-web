"use client"

import { Volume2Icon, VolumeXIcon } from "lucide-react"

interface WordAudioButtonProps {
  playing: boolean
  failed: boolean
  onClick: () => void
  className?: string
}

/** Tombol speaker untuk memutar audio satu kata. */
export default function WordAudioButton({
  playing,
  failed,
  onClick,
  className = "",
}: WordAudioButtonProps) {
  const label = failed
    ? "Audio tidak tersedia, coba lagi"
    : playing
      ? "Hentikan audio kata"
      : "Putar audio kata"

  return (
    <button
      aria-label={label}
      aria-pressed={playing}
      className={`inline-flex size-8 items-center justify-center rounded-full transition-colors ${
        failed
          ? "text-red-500 hover:bg-red-50"
          : playing
            ? "bg-teal-100 text-teal-700"
            : "text-slate-400 hover:bg-slate-100 hover:text-teal-600"
      } ${className}`}
      onClick={onClick}
      title={label}
      type="button">
      {failed ? (
        <VolumeXIcon className="size-4" />
      ) : (
        <Volume2Icon className={`size-4 ${playing ? "animate-pulse" : ""}`} />
      )}
    </button>
  )
}
