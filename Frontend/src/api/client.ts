const defaultBase = '/api/v1'

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw === undefined || raw === '') return defaultBase
  return raw.replace(/\/$/, '')
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { parse?: 'json' | 'void' },
): Promise<T> {
  const base = getApiBase()
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  })

  const parseMode = init?.parse ?? 'json'
  const body = parseMode === 'void' ? null : await parseJson(res)

  if (!res.ok) {
    const msg =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : res.statusText
    throw new ApiError(msg || 'Error de red', res.status, body)
  }

  return body as T
}

export function unwrapData<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data
  }
  return json as T
}

export function unwrapList<T>(json: unknown): T[] {
  const inner = unwrapData<unknown>(json)
  if (Array.isArray(inner)) return inner
  return []
}
