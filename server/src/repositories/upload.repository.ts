import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads')

const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export function imageExtension(mimeType: string) {
  return extensions[mimeType] ?? null
}

export async function saveImage(buffer: Buffer, extension: string) {
  await mkdir(uploadDirectory, { recursive: true })
  const filename = `${randomUUID()}.${extension}`
  await writeFile(path.join(uploadDirectory, filename), buffer)
  return filename
}

export function imageFilePath(filename: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|gif|webp)$/i.test(
      filename,
    )
  ) {
    return null
  }

  return path.join(uploadDirectory, filename)
}
