const shapeButtons = [
  { label: 'Rectangle', type: 'rectangle' },
  { label: 'Circle', type: 'circle' },
  { label: 'Triangle', type: 'triangle' },
  { label: 'Polygon', type: 'polygon' },
]

function getOpacityPercent(shapeStyle) {
  return Math.round((shapeStyle.opacity ?? 1) * 100)
}

function hexToRgba(color, opacity) {
  const hex = color?.replace('#', '')
  const fullHex = hex?.length === 3
    ? hex.split('').map((character) => `${character}${character}`).join('')
    : hex

  if (!fullHex || fullHex.length !== 6) {
    return color || '#1e88e5'
  }

  const red = Number.parseInt(fullHex.slice(0, 2), 16)
  const green = Number.parseInt(fullHex.slice(2, 4), 16)
  const blue = Number.parseInt(fullHex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function getShapePreviewFill(shapeStyle) {
  const opacity = shapeStyle.opacity ?? 1

  if (shapeStyle.mode === 'gradient') {
    return `linear-gradient(135deg, ${hexToRgba(shapeStyle.from, opacity)}, ${hexToRgba(shapeStyle.to, opacity)})`
  }

  return hexToRgba(shapeStyle.solid || shapeStyle.from, opacity)
}

function EditorToolbar({
  canReleaseActiveFrame,
  color,
  fontSize,
  shapeStyle,
  onAddShape,
  onAddText,
  onColorChange,
  onDeleteActiveObject,
  onFontSizeChange,
  onMoveActiveLayer,
  onReleaseActiveFrame,
  onShapeStyleChange,
}) {
  const opacityPercent = getOpacityPercent(shapeStyle)

  return (
    <div className="toolbar" aria-label="Canvas tools">
      {/* <input
        aria-label="Caption text"
        className="caption-input"
        value={captionText}
        onChange={(event) => onCaptionTextChange(event.target.value)}
      /> */}
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
        <span
          aria-label={`Shape background preview, ${opacityPercent}% opacity`}
          className="shape-preview"
          role="img"
          style={{ '--shape-preview-fill': getShapePreviewFill(shapeStyle) }}
        />
        <label className="opacity-control">
          <span>Opacity</span>
          <input
            aria-label="Shape background opacity"
            max="100"
            min="0"
            type="range"
            value={opacityPercent}
            onChange={(event) =>
              onShapeStyleChange({
                ...shapeStyle,
                opacity: Number(event.target.value) / 100,
              })
            }
          />
          <output>{opacityPercent}%</output>
        </label>
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
      <button
        className="tooltip-control"
        data-tooltip="Add a new editable text layer to the canvas"
        type="button"
        onClick={onAddText}
      >
        Text
      </button>
      {shapeButtons.map((shape) => (
        <button
          className="tooltip-control"
          data-tooltip={`Add a ${shape.label.toLowerCase()} shape layer`}
          key={shape.type}
          type="button"
          onClick={() => onAddShape(shape.type)}
        >
          {shape.label}
        </button>
      ))}
      <div className="layer-controls" aria-label="Layer order controls">
        <button
          aria-label="Send selected layer to back"
          className="tooltip-control"
          data-tooltip="Send the selected layer behind all other layers"
          type="button"
          onClick={() => onMoveActiveLayer('back')}
        >
          B
        </button>
        <button
          aria-label="Send selected layer backward"
          className="tooltip-control"
          data-tooltip="Move the selected layer one step backward"
          type="button"
          onClick={() => onMoveActiveLayer('backward')}
        >
          -
        </button>
        <button
          aria-label="Bring selected layer forward"
          className="tooltip-control"
          data-tooltip="Move the selected layer one step forward"
          type="button"
          onClick={() => onMoveActiveLayer('forward')}
        >
          +
        </button>
        <button
          aria-label="Bring selected layer to front"
          className="tooltip-control"
          data-tooltip="Bring the selected layer above all other layers"
          type="button"
          onClick={() => onMoveActiveLayer('front')}
        >
          F
        </button>
      </div>
      {canReleaseActiveFrame && (
        <button
          aria-label="Release image from shape"
          type="button"
          className="release-button tooltip-control"
          data-tooltip="Separate the framed image from its shape"
          onClick={onReleaseActiveFrame}
        >
          <span aria-hidden="true" className="release-icon">
            /
          </span>
          Release
        </button>
      )}
      <button
        type="button"
        className="secondary-button tooltip-control"
        data-tooltip="Delete the selected layer or selected group"
        onClick={onDeleteActiveObject}
      >
        Delete
      </button>
    </div>
  )
}

export default EditorToolbar
