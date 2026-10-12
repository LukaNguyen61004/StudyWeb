import type { Lesson } from './lessons'

function normalizeSearch(value: string) {
  return value
    .normalize('NFC')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

function searchWords(value: string) {
  return normalizeSearch(value).split(/[^a-z0-9]+/).filter((word) => word !== '')
}

export function lessonMatchesQuery(lesson: Lesson, query: string) {
  const queryWords = searchWords(query)
  if (queryWords.length === 0) {
    return true
  }

  const words = new Set([
    ...searchWords(lesson.title),
    ...searchWords(lesson.authorNickname),
  ])
  return queryWords.every((word) => words.has(word))
}
