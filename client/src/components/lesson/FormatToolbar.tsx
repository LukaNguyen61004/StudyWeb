import type { TextFormat } from '../../data/lessonContent'

type FormatToolbarProps = {
  disabled?: boolean
  onFormat: (format: TextFormat) => void
}

function FormatToolbar({ disabled, onFormat }: FormatToolbarProps) {
  return (
    <span className="write-formats">
      <button
        className="write-format write-format-bold"
        type="button"
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onFormat('bold')}
      >
        Đậm
      </button>
      <button
        className="write-format write-format-italic"
        type="button"
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onFormat('italic')}
      >
        Nghiêng
      </button>
      <button
        className="write-format write-format-underline"
        type="button"
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onFormat('underline')}
      >
        Gạch chân
      </button>
    </span>
  )
}

export default FormatToolbar
