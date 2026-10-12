import { z } from 'zod'

export const lessonInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(100000),
  authorNickname: z.string().trim().min(1).max(80),
})

export type LessonInput = z.infer<typeof lessonInputSchema>
