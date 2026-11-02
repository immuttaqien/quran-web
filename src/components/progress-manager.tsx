"use client"

import { useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import useKnownWords from "@/hooks/use-known-words"
import useReviewCards from "@/hooks/use-review-cards"
import {
  clearKnownWords,
  getSnapshot,
  parseKnownKeys,
  setKnownWords,
} from "@/lib/known-words-store"
import {
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  mergeProgress,
  type Progress,
  parseBackup,
} from "@/lib/progress-backup"
import {
  clearReviews,
  getReviewSnapshot,
  parseReviews,
  setReviews,
} from "@/lib/review-store"

interface Pending {
  fileName: string
  progress: Progress
  skipped: number
}

interface Message {
  type: "success" | "error"
  text: string
}

type Confirm = "reset" | "replace" | null

function readCurrent(): Progress {
  return {
    knownWords: parseKnownKeys(getSnapshot()),
    reviews: parseReviews(getReviewSnapshot()),
  }
}

function writeProgress({ knownWords, reviews }: Progress) {
  setKnownWords(knownWords)
  setReviews(reviews)
}

function summary({ knownWords, reviews }: Progress) {
  return `${knownWords.length.toLocaleString("id-ID")} kata dikenal dan ${Object.keys(reviews).length.toLocaleString("id-ID")} jadwal ulasan`
}

export default function ProgressManager() {
  const { knownWords } = useKnownWords()
  const reviewCards = useReviewCards()

  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState<Message | null>(null)
  const [confirm, setConfirm] = useState<Confirm>(null)

  const exportProgress = () => {
    const now = new Date()
    const blob = new Blob(
      [JSON.stringify(createBackup(readCurrent(), now), null, 2)],
      {
        type: "application/json",
      }
    )
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = backupFileName(now)
    link.click()

    URL.revokeObjectURL(url)
    setMessage({ type: "success", text: "Cadangan progres diunduh." })
  }

  const chooseFile = async (file: File | undefined) => {
    setPending(null)
    setMessage(null)
    if (!file) return

    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({ type: "error", text: "File terlalu besar (maksimal 5 MB)." })
      return
    }

    const result = parseBackup(await file.text())

    if (!result.ok) {
      setMessage({ type: "error", text: result.error })
      return
    }

    setPending({
      fileName: file.name,
      progress: result.progress,
      skipped: result.skipped,
    })
  }

  const applyImport = (mode: "merge" | "replace") => {
    if (!pending) return

    writeProgress(
      mode === "merge"
        ? mergeProgress(readCurrent(), pending.progress)
        : pending.progress
    )

    setMessage({
      type: "success",
      text:
        mode === "merge"
          ? `Progres digabungkan: ${summary(pending.progress)} dari file ditambahkan.`
          : `Progres ditimpa dengan isi file: ${summary(pending.progress)}.`,
    })
    setPending(null)
  }

  const resetAll = () => {
    clearKnownWords()
    clearReviews()
    setPending(null)
    setMessage({ type: "success", text: "Seluruh progres sudah dihapus." })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Progres tersimpan di perangkat ini
        </h2>
        <p className="text-slate-600">
          {knownWords.size.toLocaleString("id-ID")} kata dikenal ·{" "}
          {reviewCards.length.toLocaleString("id-ID")} kata terjadwal untuk
          diulas
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Data hanya ada di browser ini. Ekspor secara berkala agar tidak hilang
          saat data browser dibersihkan, atau untuk memindahkannya ke perangkat
          lain.
        </p>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Ekspor</h2>
        <p className="mb-4 text-sm text-slate-500">
          Unduh seluruh progres sebagai file JSON.
        </p>
        <Button onClick={exportProgress} type="button">
          Unduh cadangan
        </Button>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Impor</h2>
        <p className="mb-4 text-sm text-slate-500">
          Pulihkan progres dari file cadangan yang pernah diunduh.
        </p>

        <input
          accept="application/json,.json"
          aria-label="Pilih file cadangan"
          className="sr-only"
          onChange={(event) => {
            void chooseFile(event.target.files?.[0])
            // Izinkan memilih file yang sama lagi setelahnya.
            event.target.value = ""
          }}
          ref={fileInput}
          type="file"
        />
        <Button
          onClick={() => fileInput.current?.click()}
          type="button"
          variant="outline">
          Pilih file cadangan…
        </Button>

        {pending && (
          <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-4">
            <p className="font-medium text-teal-900">{pending.fileName}</p>
            <p className="text-sm text-teal-800">
              Berisi {summary(pending.progress)}.
              {pending.skipped > 0 &&
                ` ${pending.skipped.toLocaleString("id-ID")} entri tidak valid dilewati.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => applyImport("merge")} type="button">
                Gabungkan dengan progres saat ini
              </Button>
              <Button
                onClick={() => setConfirm("replace")}
                type="button"
                variant="outline">
                Timpa progres saat ini
              </Button>
              <Button
                onClick={() => setPending(null)}
                type="button"
                variant="ghost">
                Batal
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-red-700">Reset</h2>
        <p className="mb-4 text-sm text-slate-500">
          Hapus seluruh kata dikenal dan jadwal ulasan dari browser ini.
          Tindakan ini tidak bisa dibatalkan, jadi ekspor dulu bila perlu.
        </p>
        <Button
          onClick={() => setConfirm("reset")}
          type="button"
          variant="destructive">
          Reset semua progres
        </Button>
      </section>

      <div aria-live="polite" role="status">
        {message && (
          <p
            className={
              message.type === "success" ? "text-emerald-700" : "text-red-700"
            }>
            {message.text}
          </p>
        )}
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setConfirm(null)
        }}
        open={confirm !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "reset"
                ? "Hapus seluruh progres?"
                : "Timpa progres saat ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "reset"
                ? "Semua kata dikenal dan jadwal ulasan di browser ini akan dihapus permanen."
                : "Progres saat ini akan diganti seluruhnya dengan isi file. Kata yang tidak ada di file akan hilang."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm === "reset") resetAll()
                else applyImport("replace")
              }}>
              {confirm === "reset" ? "Ya, hapus semua" : "Ya, timpa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
