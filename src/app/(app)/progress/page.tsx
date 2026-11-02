import Link from "next/link"
import AppHeader from "@/components/layout/app-header"
import ProgressManager from "@/components/progress-manager"

export default function ProgressPage() {
  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Data progres", active: true }]} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Link className="text-sm text-teal-600 hover:underline" href="/">
            ← Daftar Surah
          </Link>
          <h1 className="mb-6 text-3xl font-bold text-slate-900">
            Data progres
          </h1>
          <ProgressManager />
        </div>
      </div>
    </>
  )
}
