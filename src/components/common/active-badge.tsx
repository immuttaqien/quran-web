import DotBadge from "./dot-badge"

interface ActiveBadgeProps {
  active?: boolean
}

export default function ActiveBadge({ active = false }: ActiveBadgeProps) {
  if (!active) return <DotBadge className="bg-red-500" label="Tidak Aktif" />
  return <DotBadge className="bg-emerald-500" label="Aktif" />
}
