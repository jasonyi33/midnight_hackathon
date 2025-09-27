export class ApiRequestError extends Error {
  public readonly status: number
  public readonly detail?: unknown

  constructor(message: string, status: number, detail?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.detail = detail
  }
}

export const apiError = async (response: Response): Promise<ApiRequestError> => {
  let detail: unknown
  try {
    detail = await response.json()
  } catch {
    detail = undefined
  }
  return new ApiRequestError(response.statusText || 'Request failed', response.status, detail)
}
