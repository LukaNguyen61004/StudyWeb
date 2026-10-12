const apiBase = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  if (path.startsWith('/api/')) {
    return `${apiBase}${path}`
  }
  return path
}
