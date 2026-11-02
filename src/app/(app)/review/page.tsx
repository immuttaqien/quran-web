import AppHeader from "@/components/layout/app-header"
import ReviewMode from "@/components/review-mode"

export default function ReviewPage() {
  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Ulasan", active: true }]} />
      <ReviewMode />
    </>
  )
}
