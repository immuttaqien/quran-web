export type ListQuery<T = Record<string, unknown>> = {
  start?: number
  limit?: number
  keyword?: string
} & T
