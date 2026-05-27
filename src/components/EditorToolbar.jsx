const shapeButtons = [
  { label: 'Rectangle', type: 'rectangle' },
  { label: 'Circle', type: 'circle' },
  { label: 'Triangle', type: 'triangle' },
  { label: 'Polygon', type: 'polygon' },
]

function EditorToolbar({
  captionText,
  canReleaseActiveFrame,
  color,
  fontSize,
  shapeStyle,
  onAddShape,
  onAddText,
  onCaptionTextChange,
  onColorChange,
  onDeleteActiveObject,
  onFontSizeChange,
  onMoveActiveLayer,
  onReleaseActiveFrame,
  onShapeStyleChange,
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
        <span>Text</span>
        <input
          aria-label="Text color"
          className="color-input"
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
        />
      </label>
      <div className="shape-style-control" aria-label="Shape background style">
        <span>Background</span>
        <select
          aria-label="Shape background mode"
          value={shapeStyle.mode}
          onChange={(event) =>
            onShapeStyleChange({
              ...shapeStyle,
              mode: event.target.value,
            })
          }
        >
          <option value="solid">Solid</option>
          <option value="gradient">Gradient</option>
        </select>
        {shapeStyle.mode === 'solid' && (
          <input
            aria-label="Shape background color"
            className="color-input"
            type="color"
            value={shapeStyle.solid || shapeStyle.from}
            onChange={(event) =>
              onShapeStyleChange({
                ...shapeStyle,
                solid: event.target.value,
              })
            }
          />
        )}
        {shapeStyle.mode === 'gradient' && (
          <>
            <input
              aria-label="Gradient start color"
              className="color-input"
              type="color"
              value={shapeStyle.from}
              onChange={(event) =>
                onShapeStyleChange({
                  ...shapeStyle,
                  from: event.target.value,
                })
              }
            />
            <input
              aria-label="Gradient end color"
              className="color-input"
              type="color"
              value={shapeStyle.to}
              onChange={(event) =>
                onShapeStyleChange({
                  ...shapeStyle,
                  to: event.target.value,
                })
              }
            />
          </>
        )}
      </div>
      <label className="font-size-control">
        <span>Size</span>
        <input
          aria-label="Caption font size"
          max="96"
          min="18"
          type="number"
          value={fontSize}
          onChange={(event) => {
            const nextFontSize = Number(event.target.value)

            if (Number.isFinite(nextFontSize)) {
              onFontSizeChange(nextFontSize)
            }
          }}
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
      <div className="layer-controls" aria-label="Layer order controls">
        <button title="Send to back" type="button" onClick={() => onMoveActiveLayer('back')}>
          B
        </button>
        <button title="Send backward" type="button" onClick={() => onMoveActiveLayer('backward')}>
          -
        </button>
        <button title="Bring forward" type="button" onClick={() => onMoveActiveLayer('forward')}>
          +
        </button>
        <button title="Bring to front" type="button" onClick={() => onMoveActiveLayer('front')}>
          F
        </button>
      </div>
      {canReleaseActiveFrame && (
        <button
          aria-label="Release image from shape"
          title="Release image from shape"
          type="button"
          className="release-button"
          onClick={onReleaseActiveFrame}
        >
          <span aria-hidden="true" className="release-icon">
            /
          </span>
          Release
        </button>
      )}
      <button type="button" className="secondary-button" onClick={onDeleteActiveObject}>
        Delete
      </button>
    </div>
  )
}

export default EditorToolbar
