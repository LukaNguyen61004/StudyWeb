import { Router } from 'express'
import * as lessonController from '../controllers/lesson.controller.js'

export const lessonRouter = Router()

lessonRouter.get('/', lessonController.listLessons)
lessonRouter.get('/:id', lessonController.getLesson)
lessonRouter.post('/', lessonController.createLesson)
lessonRouter.patch('/:id', lessonController.updateLesson)
lessonRouter.delete('/:id', lessonController.deleteLesson)
