import EditorToolbar from './EditorToolbar'
import LayersPanel from './LayersPanel'

function CanvasEditor({
  canvasRef,
  canReleaseActiveFrame,
  captionText,
  color,
  fontSize,
  layers,
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
    <section className="editor-panel">
      <EditorToolbar
        captionText={captionText}
        canReleaseActiveFrame={canReleaseActiveFrame}
        color={color}
        fontSize={fontSize}
        shapeStyle={shapeStyle}
        onAddShape={onAddShape}
        onAddText={onAddText}
        onCaptionTextChange={onCaptionTextChange}
        onColorChange={onColorChange}
        onDeleteActiveObject={onDeleteActiveObject}
        onFontSizeChange={onFontSizeChange}
        onMoveActiveLayer={onMoveActiveLayer}
        onReleaseActiveFrame={onReleaseActiveFrame}
        onShapeStyleChange={onShapeStyleChange}
      />

      <div className="editor-body">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
        <LayersPanel layers={layers} />
      </div>
    </section>
  )
}

export default CanvasEditor
