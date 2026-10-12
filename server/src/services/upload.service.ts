import { HttpError } from '../lib/httpError.js'
import { imageExtension, saveImage } from '../repositories/upload.repository.js'

const maxBytes = 5 * 1024 * 1024

type UploadFile = {
  buffer: Buffer
  mimetype: string
  size: number
}

export async function storeImage(file: UploadFile | undefined) {
  if (!file) {
    throw new HttpError(400, 'Chọn một ảnh.')
  }
  if (file.size > maxBytes) {
    throw new HttpError(400, 'Ảnh tối đa 5 MB.')
  }

  const extension = imageExtension(file.mimetype)
  if (!extension) {
    throw new HttpError(400, 'Chỉ nhận ảnh JPG, PNG, GIF hoặc WebP.')
  }

  const filename = await saveImage(file.buffer, extension)
  return { url: `/api/uploads/${filename}` }
}
