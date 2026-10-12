import { useState, type ChangeEvent } from 'react'
import { uploadImage } from '../../data/api'

type ImageUploadButtonProps = {
  disabled?: boolean
  onUploaded: (url: string) => void
}

function ImageUploadButton({ disabled, onUploaded }: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setUploading(true)
    setError('')
    try {
      const image = await uploadImage(file)
      onUploaded(image.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Không tải được ảnh.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <label className="write-image">
        {uploading ? 'Đang tải ảnh...' : 'Chèn ảnh'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          disabled={disabled || uploading}
          onChange={handleChange}
        />
      </label>
      <span className="write-hint">Ảnh nằm đúng chỗ con trỏ trong bài.</span>
      {error ? <span className="write-error">{error}</span> : null}
    </>
  )
}

export default ImageUploadButton
