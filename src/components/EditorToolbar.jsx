const shapeButtons = [
  { label: 'Rectangle', type: 'rectangle' },
  { label: 'Circle', type: 'circle' },
  { label: 'Triangle', type: 'triangle' },
  { label: 'Polygon', type: 'polygon' },
]

function EditorToolbar({
  captionText,
  color,
  fontSize,
  onAddShape,
  onAddText,
  onCaptionTextChange,
  onColorChange,
  onDeleteActiveObject,
  onFontSizeChange,
}) {
  return (
    <div className="toolbar" aria-label="Canvas tools">
      <input
        aria-label="Caption text"
        className="caption-input"
        value={captionText}
        onChange={(event) => onCaptionTextChange(event.target.value)}
      />
      <label className="color-control">
        <span>Color</span>
        <input
          aria-label="Layer color"
          className="color-input"
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
        />
      </label>
      <label className="font-size-control">
        <span>Size</span>
        <input
          aria-label="Caption font size"
          max="96"
          min="18"
          type="number"
          value={fontSize}
          onChange={(event) => onFontSizeChange(Number(event.target.value))}
        />
      </label>
      <button type="button" onClick={onAddText}>
        Text
      </button>
      {shapeButtons.map((shape) => (
        <button key={shape.type} type="button" onClick={() => onAddShape(shape.type)}>
          {shape.label}
        </button>
      ))}
      <button type="button" className="secondary-button" onClick={onDeleteActiveObject}>
        Delete
      </button>
    </div>
  )
}

export default EditorToolbar
