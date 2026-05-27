export function enforceLayerOrder(canvas) {
  const objects = canvas.getObjects()

  objects.filter((object) => object.kind === 'image').forEach((object) => object.sendToBack())
  objects.filter((object) => object.kind === 'shape').forEach((object) => canvas.bringForward(object))
  objects.filter((object) => object.kind === 'text').forEach((object) => object.bringToFront())
}

export function extractLayers(canvas) {
  return canvas.getObjects().map((object, index) => ({
    index,
    type: object.kind || object.type,
    fabricType: object.type,
    text: object.text,
    name: object.name,
    left: Math.round(object.left ?? 0),
    top: Math.round(object.top ?? 0),
    width: Math.round(object.getScaledWidth?.() ?? object.width ?? 0),
    height: Math.round(object.getScaledHeight?.() ?? object.height ?? 0),
    angle: Math.round(object.angle ?? 0),
    fill: object.fill,
    stroke: object.stroke,
  }))
}
