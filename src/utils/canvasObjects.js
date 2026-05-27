const shapeDefaults = {
  fill: 'rgba(30, 136, 229, 0.34)',
  stroke: '#1e88e5',
  strokeWidth: 3,
  left: 140,
  top: 120,
}

const polygonPoints = [
  { x: 80, y: 0 },
  { x: 160, y: 52 },
  { x: 130, y: 150 },
  { x: 30, y: 150 },
  { x: 0, y: 52 },
]

export function createCaption({ fabric, text, color, fontSize }) {
  return new fabric.Textbox(text || 'Caption', {
    kind: 'text',
    left: 180,
    top: 160,
    width: 360,
    fontSize,
    fontWeight: 700,
    fill: color,
    stroke: '#ffffff',
    strokeWidth: 1,
    shadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
  })
}

export function createShape({ fabric, type, color }) {
  const options = {
    ...shapeDefaults,
    kind: 'shape',
    fill: `${color}55`,
    stroke: color,
  }

  const shapeMap = {
    rectangle: () => new fabric.Rect({ ...options, width: 190, height: 120, rx: 4, ry: 4 }),
    circle: () => new fabric.Circle({ ...options, radius: 72 }),
    triangle: () => new fabric.Triangle({ ...options, width: 160, height: 150 }),
    polygon: () => new fabric.Polygon(polygonPoints, options),
  }

  const createFabricShape = shapeMap[type]

  if (!createFabricShape) {
    throw new Error(`Unsupported shape type: ${type}`)
  }

  return createFabricShape()
}
