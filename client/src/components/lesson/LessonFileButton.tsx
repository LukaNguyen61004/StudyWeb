import { useState, type ChangeEvent } from 'react'
import { readLessonFile, type LessonFileDraft } from '../../data/lessonFile'

type LessonFileButtonProps = {
  disabled?: boolean
  onLoaded: (draft: LessonFileDraft) => void
}

function LessonFileButton({ disabled, onLoaded }: LessonFileButtonProps) {
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    setReading(true)
    setError('')
    try {
      onLoaded(await readLessonFile(file))
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Không đọc được file.')
    } finally {
      setReading(false)
    }
  }

  return (
    <>
      <label className="write-image">
        {reading ? 'Đang đọc file...' : 'Tải file'}
        <input
          type="file"
          accept=".txt,.md,.markdown,.docx,.pdf,.pptx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          disabled={disabled || reading}
          onChange={handleChange}
        />
      </label>
      {error ? <span className="write-error">{error}</span> : null}
    </>
  )
}

export default LessonFileButton
