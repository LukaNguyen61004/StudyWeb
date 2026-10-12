import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import multer from 'multer'
import { HttpError } from './lib/httpError.js'
import { lessonRouter } from './routes/lesson.route.js'
import { uploadRouter } from './routes/upload.route.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/lessons', lessonRouter)
app.use('/api/uploads', uploadRouter)

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'Ảnh tối đa 5 MB.' })
    return
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message })
    return
  }

  console.error(error)
  res.status(500).json({ message: 'Lỗi máy chủ.' })
}

app.use(errorHandler)

export default app
