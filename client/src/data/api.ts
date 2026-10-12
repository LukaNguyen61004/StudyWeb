import type { Lesson } from './lessons'

export type LessonInput = {
  title: string
  content: string
  authorNickname: string
}

async function readError(response: Response) {
  try {
    const body: unknown = await response.json()
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
    ) {
      return body.message
    }
  } catch {
    // The response body is not JSON.
  }

  return 'Không kết nối được máy chủ.'
}

export async function fetchLessons() {
  const response = await fetch('/api/lessons')
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as Lesson[]
}

export async function fetchLesson(id: string) {
  const response = await fetch(`/api/lessons/${encodeURIComponent(id)}`)
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as Lesson
}

export async function createLesson(input: LessonInput) {
  const response = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as Lesson
}

export async function uploadImage(file: File) {
  const body = new FormData()
  body.append('image', file)
  const response = await fetch('/api/uploads', {
    method: 'POST',
    body,
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as { url: string }
}

export async function updateLesson(id: string, input: LessonInput) {
  const response = await fetch(`/api/lessons/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return (await response.json()) as Lesson
}
