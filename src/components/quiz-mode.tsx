"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import useKnownWords from "@/hooks/use-known-words"
import { wordKey } from "@/lib/known-words-store"
import { buildQuestions, type QuizQuestion } from "@/lib/quiz"
import type { Chapter, QuranWord } from "@/lib/quran-api"

interface QuizModeProps {
  chapter: Chapter
  page: number
  words: QuranWord[]
}

export default function QuizMode({ chapter, page, words }: QuizModeProps) {
  const { markKnown } = useKnownWords()

  // Soal diacak, jadi baru dibuat di klien setelah mount agar tidak beda dengan HTML server.
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrong, setWrong] = useState<QuizQuestion[]>([])

  const start = (next: QuizQuestion[]) => {
    setQuestions(next)
    setIndex(0)
    setSelected(null)
    setCorrectCount(0)
    setWrong([])
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: hanya dijalankan saat daftar kata berubah
  useEffect(() => {
    start(buildQuestions(words))
  }, [words])

  const backHref = `/surah/${chapter.id}?page=${page}`

  if (questions === null) return null

  if (questions.length === 0) {
    return (
      <QuizShell chapter={chapter} page={page}>
        <p className="text-slate-600">
          Halaman ini belum punya cukup kata untuk dijadikan kuis.
        </p>
        <Link
          className="mt-6 inline-block text-teal-600 hover:underline"
          href={backHref}>
          ← Kembali membaca
        </Link>
      </QuizShell>
    )
  }

  if (index >= questions.length) {
    return (
      <QuizShell chapter={chapter} page={page}>
        <h2 className="text-2xl font-bold text-slate-900">Kuis selesai</h2>
        <p className="mt-2 text-slate-600">
          Benar {correctCount} dari {questions.length} soal. Kata yang dijawab
          benar otomatis ditandai sudah dikenal.
        </p>

        {wrong.length > 0 && (
          <ul className="mt-6 space-y-2">
            {wrong.map((question) => (
              <li
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                key={question.word.id}>
                <span className="text-slate-700">{question.answer}</span>
                <span className="text-2xl text-slate-900" dir="rtl">
                  {question.word.arabic}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {wrong.length > 0 && (
            <button
              className="rounded-lg bg-teal-600 px-6 py-2 font-medium text-white transition-colors hover:bg-teal-700"
              onClick={() =>
                start(
                  buildQuestions(
                    wrong.map((q) => q.word),
                    words
                  )
                )
              }
              type="button">
              Ulangi yang salah
            </button>
          )}
          <button
            className="rounded-lg bg-slate-800 px-6 py-2 font-medium text-white transition-colors hover:bg-slate-900"
            onClick={() => start(buildQuestions(words))}
            type="button">
            Kuis lagi
          </button>
          <Link
            className="rounded-lg border border-slate-200 px-6 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            href={backHref}>
            Kembali membaca
          </Link>
        </div>
      </QuizShell>
    )
  }

  const question = questions[index]
  const answered = selected !== null

  const choose = (option: string) => {
    if (answered) return

    setSelected(option)

    if (option === question.answer) {
      setCorrectCount((count) => count + 1)
      markKnown(wordKey(question.word.verseKey, question.word.position))
    } else {
      setWrong((list) => [...list, question])
    }
  }

  return (
    <QuizShell chapter={chapter} page={page}>
      <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
        <span>
          Soal {index + 1} dari {questions.length}
        </span>
        <span>Benar: {correctCount}</span>
      </div>
      <div className="mb-8 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-teal-500 transition-all duration-300"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <p
        className="text-center text-6xl font-bold leading-tight text-slate-900"
        dir="rtl">
        {question.word.arabic}
      </p>
      <p className="mb-6 mt-3 text-center text-sm text-slate-500">
        Apa arti kata ini?
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isAnswer = option === question.answer
          const isSelected = option === selected

          let tone =
            "border-slate-200 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50"
          if (answered && isAnswer) {
            tone = "border-emerald-300 bg-emerald-50 text-emerald-800"
          } else if (answered && isSelected) {
            tone = "border-red-300 bg-red-50 text-red-800"
          } else if (answered) {
            tone = "border-slate-100 bg-white text-slate-400"
          }

          return (
            <button
              className={`rounded-lg border px-4 py-3 text-left font-medium transition-colors ${tone}`}
              disabled={answered}
              key={option}
              onClick={() => choose(option)}
              type="button">
              {option}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="mt-6 min-h-12">
        {answered && (
          <div className="flex items-center justify-between gap-4">
            <p
              className={
                selected === question.answer
                  ? "text-emerald-700"
                  : "text-red-700"
              }>
              {selected === question.answer
                ? "Benar!"
                : `Kurang tepat. Jawabannya: ${question.answer}`}
            </p>
            <button
              className="rounded-lg bg-teal-600 px-6 py-2 font-medium text-white transition-colors hover:bg-teal-700"
              onClick={() => {
                setIndex(index + 1)
                setSelected(null)
              }}
              type="button">
              {index + 1 === questions.length ? "Lihat hasil" : "Lanjut"}
            </button>
          </div>
        )}
      </div>
    </QuizShell>
  )
}

function QuizShell({
  chapter,
  page,
  children,
}: {
  chapter: Chapter
  page: number
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          className="text-sm text-teal-600 hover:underline"
          href={`/surah/${chapter.id}?page=${page}`}>
          ← {chapter.nameSimple}
        </Link>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          Kuis: {chapter.nameSimple}
        </h1>
        <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
