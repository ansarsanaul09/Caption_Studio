import { useCallback, useEffect, useRef, useState } from 'react'
import { triggerUnsplashDownload } from '../services/unsplashApi'
import { enforceLayerOrder, extractLayers } from '../utils/canvasLayers'
import { createCaption, createShape } from '../utils/canvasObjects'

const CANVAS_WIDTH = 840
const CANVAS_HEIGHT = 560
const CANVAS_BACKGROUND = '#f8fafc'

function useFabricCanvas({ captionText, color, fontSize, onSelectedImageChange, onStatusChange }) {
  const fabricCanvasRef = useRef(null)
  const pendingImageRef = useRef(null)
  const selectedImageRef = useRef(null)
  const [canvasElement, setCanvasElement] = useState(null)
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
            kind: 'image',
            selectable: false,
            evented: false,
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
          canvas.renderAll()
          setLayers(extractLayers(canvas))
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
    canvas.on('object:added', syncLayers)
    canvas.on('object:modified', syncLayers)
    canvas.on('object:removed', syncLayers)
    canvas.on('selection:created', syncLayers)
    canvas.on('selection:updated', syncLayers)
    syncLayers()

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
    enforceLayerOrder(canvas)
    canvas.setActiveObject(textbox)
    canvas.renderAll()
    setLayers(extractLayers(canvas))
  }

  function addShape(type) {
    const canvas = fabricCanvasRef.current
    if (!canvas || !window.fabric) return

    try {
      const shape = createShape({ fabric: window.fabric, type, color })
      canvas.add(shape)
      enforceLayerOrder(canvas)
      canvas.setActiveObject(shape)
      canvas.renderAll()
      setLayers(extractLayers(canvas))
    } catch (error) {
      onStatusChange(error.message || 'Unable to add this shape.')
    }
  }

  function deleteActiveObject() {
    const canvas = fabricCanvasRef.current
    const active = canvas?.getActiveObject()
    if (!canvas || !active || active.kind === 'image') return

    canvas.remove(active)
    canvas.discardActiveObject()
    canvas.renderAll()
    setLayers(extractLayers(canvas))
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
    layers,
    loadImageToCanvas,
    addText,
    addShape,
    deleteActiveObject,
    downloadImage,
  }
}

export default useFabricCanvas
