const shapeDefaults = {
  fill: '#1e88e5',
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
    shadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
  })
}

export function createShape({ fabric, type, shapeStyle }) {
  const normalizedShapeStyle = normalizeShapeStyle(shapeStyle)
  const fill = createShapeFill({
    fabric,
    shapeStyle: normalizedShapeStyle,
    width: 190,
    height: 150,
  })
  const stroke = getShapeStrokeColor(normalizedShapeStyle)
  const options = {
    ...shapeDefaults,
    kind: 'shape',
    fill,
    opacity: getShapeOpacity(normalizedShapeStyle),
    shapeStyle: normalizedShapeStyle,
    stroke,
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

export function normalizeShapeStyle(shapeStyle) {
  return {
    from: shapeStyle?.from || '#1e88e5',
    mode: shapeStyle?.mode === 'gradient' ? 'gradient' : 'solid',
    opacity: getShapeOpacity(shapeStyle),
    solid: shapeStyle?.solid || shapeStyle?.from || '#1e88e5',
    to: shapeStyle?.to || '#7c3aed',
  }
}

export function createShapeFill({ color, fabric, height, shapeStyle, width }) {
  const normalizedShapeStyle = normalizeShapeStyle(shapeStyle)

  if (normalizedShapeStyle.mode !== 'gradient') {
    return normalizedShapeStyle.solid || color || shapeDefaults.fill
  }

  return new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: -width / 2,
      y1: -height / 2,
      x2: width / 2,
      y2: height / 2,
    },
    colorStops: [
      { offset: 0, color: normalizedShapeStyle.from },
      { offset: 1, color: normalizedShapeStyle.to },
    ],
  })
}

export function getShapeStrokeColor(shapeStyle) {
  const normalizedShapeStyle = normalizeShapeStyle(shapeStyle)

  if (normalizedShapeStyle.mode === 'gradient') {
    return normalizedShapeStyle.from || shapeDefaults.stroke
  }

  return normalizedShapeStyle.solid || shapeDefaults.stroke
}

export function getShapeOpacity(shapeStyle) {
  const opacity = shapeStyle?.opacity

  if (!Number.isFinite(opacity)) {
    return 1
  }

  return Math.min(Math.max(opacity, 0), 1)
}
