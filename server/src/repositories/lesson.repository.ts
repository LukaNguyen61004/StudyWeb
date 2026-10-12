import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import type { LessonInput } from '../schemas/lesson.schema.js'

function isMissingRow(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2025' || error.code === 'P2023')
  )
}

export function findAll() {
  return prisma.lesson.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function findById(id: string) {
  try {
    return await prisma.lesson.findUnique({ where: { id } })
  } catch (error) {
    if (isMissingRow(error)) {
      return null
    }
    throw error
  }
}

export function create(input: LessonInput) {
  return prisma.lesson.create({ data: input })
}

export async function update(id: string, input: LessonInput) {
  try {
    return await prisma.lesson.update({
      where: { id },
      data: input,
    })
  } catch (error) {
    if (isMissingRow(error)) {
      return null
    }
    throw error
  }
}

export async function remove(id: string) {
  try {
    await prisma.lesson.delete({ where: { id } })
    return true
  } catch (error) {
    if (isMissingRow(error)) {
      return false
    }
    throw error
  }
}
