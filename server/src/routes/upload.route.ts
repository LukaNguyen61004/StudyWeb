import { Router } from 'express'
import multer from 'multer'
import * as uploadController from '../controllers/upload.controller.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('image'), uploadController.createUpload)
uploadRouter.get('/:filename', uploadController.showUpload)
