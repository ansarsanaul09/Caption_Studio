import EditorToolbar from './EditorToolbar'

function CanvasEditor({
  canvasRef,
  canReleaseActiveFrame,
  captionText,
  color,
  fontSize,
  onAddShape,
  onAddText,
  onCaptionTextChange,
  onColorChange,
  onDeleteActiveObject,
  onFontSizeChange,
  onReleaseActiveFrame,
}) {
  return (
    <section className="editor-panel">
      <EditorToolbar
        captionText={captionText}
        canReleaseActiveFrame={canReleaseActiveFrame}
        color={color}
        fontSize={fontSize}
        onAddShape={onAddShape}
        onAddText={onAddText}
        onCaptionTextChange={onCaptionTextChange}
        onColorChange={onColorChange}
        onDeleteActiveObject={onDeleteActiveObject}
        onFontSizeChange={onFontSizeChange}
        onReleaseActiveFrame={onReleaseActiveFrame}
      />

      <div className="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </section>
  )
}

export default CanvasEditor
