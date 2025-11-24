export interface ListResponse<T> {
  data: T[]
}

export type SingleResponse<T, U = Record<string, unknown>> = {
  data: T
} & U

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}
