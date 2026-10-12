import type { RequestHandler } from 'express'
import { imageFilePath } from '../repositories/upload.repository.js'
import * as uploadService from '../services/upload.service.js'

function routeFilename(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : ''
}

export const createUpload: RequestHandler = async (req, res) => {
  const file = req.file
  const image = await uploadService.storeImage(
    file
      ? {
          buffer: file.buffer,
          mimetype: file.mimetype,
          size: file.size,
        }
      : undefined,
  )
  res.status(201).json(image)
}

export const showUpload: RequestHandler = (req, res) => {
  const filePath = imageFilePath(routeFilename(req.params.filename))
  if (!filePath) {
    res.status(404).json({ message: 'Không có ảnh này.' })
    return
  }

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: 'Không có ảnh này.' })
    }
  })
}
