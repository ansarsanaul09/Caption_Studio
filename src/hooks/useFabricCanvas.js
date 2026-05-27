import { useCallback, useEffect, useRef, useState } from 'react'
import { triggerUnsplashDownload } from '../services/unsplashApi'
import { extractLayers } from '../utils/canvasLayers'
import { createCaption, createShape } from '../utils/canvasObjects'

const CANVAS_WIDTH = 840
const CANVAS_HEIGHT = 560
const CANVAS_BACKGROUND = '#f8fafc'
const TRANSPARENT_FRAME_FILL = 'rgba(0, 0, 0, 0)'
const MIN_FRAME_OVERLAP_RATIO = 0.35
let objectIdCounter = 0

function useFabricCanvas({ captionText, color, fontSize, onSelectedImageChange, onStatusChange }) {
  const fabricCanvasRef = useRef(null)
  const pendingImageRef = useRef(null)
  const selectedImageRef = useRef(null)
  const [canvasElement, setCanvasElement] = useState(null)
  const [canReleaseActiveFrame, setCanReleaseActiveFrame] = useState(false)
  const [layers, setLayers] = useState([])

  const canvasElementRef = useCallback((element) => {
    setCanvasElement(element)
  }, [])

  const loadImageToCanvas = useCallback(async (image) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !window.fabric) {
      pendingImageRef.current = image
      return
    }

    selectedImageRef.current = image
    onSelectedImageChange?.(image)
    onStatusChange('Loading image on canvas...')

    try {
      await triggerUnsplashDownload(image)
      canvas.clear()
      canvas.backgroundColor = CANVAS_BACKGROUND

      window.fabric.Image.fromURL(
        image.urls.regular,
        (fabricImage) => {
          if (!fabricImage) {
            onStatusChange('Unable to load this image on the canvas.')
            return
          }

          const scale = Math.min(
            CANVAS_WIDTH / fabricImage.width,
            CANVAS_HEIGHT / fabricImage.height,
          )

          fabricImage.set({
            canvasObjectId: createCanvasObjectId(),
            kind: 'image',
            selectable: true,
            evented: true,
            hasControls: true,
            hasBorders: true,
            originX: 'center',
            originY: 'center',
            left: CANVAS_WIDTH / 2,
            top: CANVAS_HEIGHT / 2,
            scaleX: scale,
            scaleY: scale,
            name: image.alt_description || image.description || 'Unsplash image',
          })

          canvas.add(fabricImage)
          fabricImage.sendToBack()
          canvas.setActiveObject(fabricImage)
          canvas.renderAll()
          setLayers(extractLayers(canvas))
          setCanReleaseActiveFrame(false)
          onStatusChange('')
        },
        { crossOrigin: 'anonymous' },
      )
    } catch (error) {
      onStatusChange(error.message || 'Unable to load the selected image.')
    }
  }, [onSelectedImageChange, onStatusChange])

  useEffect(() => {
    if (!canvasElement) {
      return
    }

    if (!window.fabric) {
      onStatusChange('Fabric.js failed to load. Check your connection and refresh.')
      return
    }

    const canvas = new window.fabric.Canvas(canvasElement, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: CANVAS_BACKGROUND,
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = canvas

    const syncLayers = () => setLayers(extractLayers(canvas))
    const syncSelectionState = () => {
      setCanReleaseActiveFrame(hasReleasableFrame(getActiveEditableObjects(canvas)))
      syncLayers()
    }
    const bringActiveObjectForward = () => {
      const activeObject = canvas.getActiveObject()

      if (!activeObject) {
        syncSelectionState()
        return
      }

      activeObject.bringToFront()
      canvas.requestRenderAll()
      syncSelectionState()
    }
    const fitActiveImageIntoShape = () => {
      const activeObject = canvas.getActiveObject()

      if (activeObject?.type === 'activeSelection') {
        syncFrameImagesForObjects(canvas, activeObject.getObjects(), syncSelectionState)
        return
      }

      if (activeObject?.kind === 'shape') {
        syncImageForShape(canvas, activeObject, syncSelectionState)
        return
      }

      if (activeObject?.kind !== 'image') {
        syncSelectionState()
        return
      }

      const targetShape = findBestOverlappingShape(canvas, activeObject)

      if (!targetShape) {
        releaseImageFromShape(canvas, activeObject)
        canvas.requestRenderAll()
        syncSelectionState()
        return
      }

      fitImageIntoShape(activeObject, targetShape, canvas, syncSelectionState)
    }
    const syncLinkedFrameOnTransform = (event) => {
      const targetObject = event.target

      if (!targetObject) {
        syncSelectionState()
        return
      }

      if (targetObject.type === 'activeSelection') {
        syncFrameImagesForObjects(canvas, targetObject.getObjects(), syncSelectionState)
        return
      }

      if (targetObject.kind === 'shape') {
        syncImageForShape(canvas, targetObject, syncSelectionState)
        return
      }

      syncSelectionState()
    }

    canvas.on('object:added', syncSelectionState)
    canvas.on('object:modified', syncLinkedFrameOnTransform)
    canvas.on('object:removed', syncSelectionState)
    canvas.on('object:moving', bringActiveObjectForward)
    canvas.on('object:scaling', syncLinkedFrameOnTransform)
    canvas.on('object:rotating', syncLinkedFrameOnTransform)
    canvas.on('mouse:up', fitActiveImageIntoShape)
    canvas.on('selection:created', bringActiveObjectForward)
    canvas.on('selection:updated', bringActiveObjectForward)
    canvas.on('selection:cleared', syncSelectionState)
    syncSelectionState()

    if (pendingImageRef.current) {
      loadImageToCanvas(pendingImageRef.current)
      pendingImageRef.current = null
    }

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [canvasElement, loadImageToCanvas, onStatusChange])

  function addText() {
    const canvas = fabricCanvasRef.current
    if (!canvas || !window.fabric) return

    const textbox = createCaption({ fabric: window.fabric, text: captionText, color, fontSize })

    canvas.add(textbox)
    canvas.setActiveObject(textbox)
    canvas.renderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(false)
  }

  function addShape(type) {
    const canvas = fabricCanvasRef.current
    if (!canvas || !window.fabric) return

    try {
      const shape = createShape({ fabric: window.fabric, type, color })
      shape.set({ canvasObjectId: createCanvasObjectId() })
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()
      setLayers(extractLayers(canvas))
      setCanReleaseActiveFrame(false)
    } catch (error) {
      onStatusChange(error.message || 'Unable to add this shape.')
    }
  }

  function updateActiveObjectColor(nextColor) {
    const canvas = fabricCanvasRef.current
    const activeObjects = getActiveEditableObjects(canvas)
    if (!canvas || !activeObjects.length) return

    activeObjects.forEach((object) => {
      if (object.kind === 'text') {
        object.set({ fill: nextColor })
      }

      if (object.kind === 'shape') {
        const nextFill = `${nextColor}55`
        object.set({
          fill: object.frameImageId ? TRANSPARENT_FRAME_FILL : nextFill,
          frameOriginalFill: object.frameImageId ? nextFill : object.frameOriginalFill,
          stroke: nextColor,
        })
      }
    })

    canvas.requestRenderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(hasReleasableFrame(getActiveEditableObjects(canvas)))
  }

  function updateActiveTextFontSize(nextFontSize) {
    const canvas = fabricCanvasRef.current
    const activeObjects = getActiveEditableObjects(canvas)
    if (!canvas || !activeObjects.length) return

    activeObjects
      .filter((object) => object.kind === 'text')
      .forEach((object) => {
        object.set({ fontSize: nextFontSize })
        object.setCoords()
      })

    canvas.requestRenderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(hasReleasableFrame(getActiveEditableObjects(canvas)))
  }

  function updateActiveTextValue(nextText) {
    const canvas = fabricCanvasRef.current
    const activeObjects = getActiveEditableObjects(canvas)
    if (!canvas || !activeObjects.length) return

    activeObjects
      .filter((object) => object.kind === 'text')
      .forEach((object) => {
        object.set({ text: nextText })
        object.setCoords()
      })

    canvas.requestRenderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(hasReleasableFrame(getActiveEditableObjects(canvas)))
  }

  function deleteActiveObject() {
    const canvas = fabricCanvasRef.current
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return

    getActiveEditableObjects(canvas).forEach((object) => {
      clearFrameLinkBeforeDelete(canvas, object)
      canvas.remove(object)
    })

    canvas.discardActiveObject()
    canvas.renderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(false)
  }

  function releaseActiveFrame() {
    const canvas = fabricCanvasRef.current
    const activeObjects = getActiveEditableObjects(canvas)
    if (!canvas || !activeObjects.length) return

    activeObjects.forEach((object) => {
      if (object.kind === 'image') {
        releaseImageFromShape(canvas, object)
      }

      if (object.kind === 'shape') {
        releaseImageFromFrameShape(canvas, object)
      }
    })

    canvas.requestRenderAll()
    setLayers(extractLayers(canvas))
    setCanReleaseActiveFrame(false)
  }

  function downloadImage() {
    const canvas = fabricCanvasRef.current
    if (!canvas || !selectedImageRef.current) {
      onStatusChange('Please select an image before downloading.')
      return
    }

    try {
      canvas.discardActiveObject()
      canvas.renderAll()
      const link = document.createElement('a')
      link.href = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 })
      link.download = 'captioned-unsplash-image.png'
      link.click()
      onStatusChange('Downloaded image.')
    } catch (error) {
      onStatusChange(error.message || 'Download failed. Try another image.')
    }
  }

  return {
    canvasElementRef,
    canReleaseActiveFrame,
    layers,
    loadImageToCanvas,
    addText,
    addShape,
    updateActiveObjectColor,
    updateActiveTextFontSize,
    updateActiveTextValue,
    deleteActiveObject,
    releaseActiveFrame,
    downloadImage,
  }
}

function createCanvasObjectId() {
  objectIdCounter += 1
  return `canvas-object-${objectIdCounter}`
}

function getActiveEditableObjects(canvas) {
  if (!canvas) {
    return []
  }

  const activeObject = canvas.getActiveObject()

  if (!activeObject) {
    return []
  }

  if (activeObject.type === 'activeSelection') {
    return activeObject.getObjects()
  }

  return [activeObject]
}

function hasReleasableFrame(objects) {
  return objects.some((object) => object.frameShapeId || object.frameImageId)
}

function findBestOverlappingShape(canvas, imageObject) {
  const imageBounds = imageObject.getBoundingRect()
  const imageCenter = imageObject.getCenterPoint()
  const imageArea = imageBounds.width * imageBounds.height

  return canvas
    .getObjects()
    .filter((object) => object.kind === 'shape')
    .map((shape) => ({
      shape,
      overlapArea: getOverlapArea(imageBounds, shape.getBoundingRect()),
    }))
    .filter(({ shape, overlapArea }) => {
      const shapeBounds = shape.getBoundingRect()
      const overlapRatio = overlapArea / Math.max(imageArea, 1)

      return isPointInsideBounds(imageCenter, shapeBounds) && overlapRatio >= MIN_FRAME_OVERLAP_RATIO
    })
    .sort((first, second) => second.overlapArea - first.overlapArea)[0]?.shape
}

function isPointInsideBounds(point, bounds) {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.left + bounds.width &&
    point.y >= bounds.top &&
    point.y <= bounds.top + bounds.height
  )
}

function fitImageIntoShape(imageObject, shapeObject, canvas, onComplete) {
  ensureCanvasObjectId(imageObject)
  ensureCanvasObjectId(shapeObject)
  preserveShapeFill(shapeObject)

  const shapeBounds = shapeObject.getBoundingRect()
  const imageWidth = imageObject.width || 1
  const imageHeight = imageObject.height || 1
  const coverScale = Math.max(shapeBounds.width / imageWidth, shapeBounds.height / imageHeight)

  imageObject.set({
    originX: 'center',
    originY: 'center',
    left: shapeBounds.left + shapeBounds.width / 2,
    top: shapeBounds.top + shapeBounds.height / 2,
    scaleX: coverScale,
    scaleY: coverScale,
  })

  imageObject.set({
    frameShapeId: shapeObject.canvasObjectId,
  })
  shapeObject.set({
    frameImageId: imageObject.canvasObjectId,
    fill: TRANSPARENT_FRAME_FILL,
  })

  shapeObject.clone((clipPath) => {
    clipPath.set({
      absolutePositioned: true,
      evented: false,
      fill: '#000000',
      selectable: false,
      stroke: null,
    })

    imageObject.set({ clipPath })
    shapeObject.bringToFront()
    imageObject.setCoords()
    shapeObject.setCoords()
    canvas.requestRenderAll()
    onComplete()
  })
}

function syncFrameImagesForObjects(canvas, objects, onComplete) {
  const shapes = objects.filter((object) => object.kind === 'shape')

  if (!shapes.length) {
    onComplete()
    return
  }

  shapes.forEach((shape) => syncImageForShape(canvas, shape, onComplete))
}

function syncImageForShape(canvas, shapeObject, onComplete) {
  if (!shapeObject.frameImageId) {
    onComplete()
    return
  }

  const linkedImage = canvas
    .getObjects()
    .find((object) => object.canvasObjectId === shapeObject.frameImageId)

  if (!linkedImage) {
    shapeObject.set({ frameImageId: null })
    onComplete()
    return
  }

  fitImageIntoShape(linkedImage, shapeObject, canvas, onComplete)
}

function releaseImageFromShape(canvas, imageObject) {
  if (imageObject.frameShapeId) {
    const linkedShape = canvas
      .getObjects()
      .find((object) => object.canvasObjectId === imageObject.frameShapeId)

    restoreShapeFill(linkedShape)
    linkedShape?.set({ frameImageId: null })
  }

  imageObject.set({
    clipPath: null,
    frameShapeId: null,
  })
}

function releaseImageFromFrameShape(canvas, shapeObject) {
  if (!shapeObject.frameImageId) {
    return
  }

  const linkedImage = canvas
    .getObjects()
    .find((object) => object.canvasObjectId === shapeObject.frameImageId)

  linkedImage?.set({
    clipPath: null,
    frameShapeId: null,
  })

  restoreShapeFill(shapeObject)
  shapeObject.set({ frameImageId: null })
}

function clearFrameLinkBeforeDelete(canvas, object) {
  if (object.kind === 'image') {
    releaseImageFromShape(canvas, object)
    return
  }

  if (object.kind !== 'shape' || !object.frameImageId) {
    return
  }

  const linkedImage = canvas
    .getObjects()
    .find((canvasObject) => canvasObject.canvasObjectId === object.frameImageId)

  linkedImage?.set({
    clipPath: null,
    frameShapeId: null,
  })
}

function ensureCanvasObjectId(object) {
  if (!object.canvasObjectId) {
    object.set({ canvasObjectId: createCanvasObjectId() })
  }
}

function preserveShapeFill(shapeObject) {
  if (!shapeObject.frameOriginalFill) {
    shapeObject.set({ frameOriginalFill: shapeObject.fill })
  }
}

function restoreShapeFill(shapeObject) {
  if (!shapeObject) {
    return
  }

  shapeObject.set({
    fill: shapeObject.frameOriginalFill || `${shapeObject.stroke || '#1e88e5'}55`,
    frameOriginalFill: null,
  })
}

function getOverlapArea(firstBounds, secondBounds) {
  const left = Math.max(firstBounds.left, secondBounds.left)
  const right = Math.min(
    firstBounds.left + firstBounds.width,
    secondBounds.left + secondBounds.width,
  )
  const top = Math.max(firstBounds.top, secondBounds.top)
  const bottom = Math.min(
    firstBounds.top + firstBounds.height,
    secondBounds.top + secondBounds.height,
  )

  if (right <= left || bottom <= top) {
    return 0
  }

  return (right - left) * (bottom - top)
}

export default useFabricCanvas
