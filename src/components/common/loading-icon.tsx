import { Loader2Icon, type LucideProps } from "lucide-react"

interface LoadingIconProps {
  loading?: boolean
  children?: React.ReactElement<LucideProps>
}

export default function LoadingIcon({ children, loading }: LoadingIconProps) {
  return loading ? <Loader2Icon className="animate-spin" /> : children
}
