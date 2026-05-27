import { useEffect, useState } from 'react'
import { FaArrowLeft, FaDownload, FaQuestion } from 'react-icons/fa6'
import CanvasEditor from './components/CanvasEditor'
import ImageResults from './components/ImageResults'
import SearchBar from './components/SearchBar'
import useFabricCanvas from './hooks/useFabricCanvas'
import { searchUnsplashImages } from './services/unsplashApi'
import './App.css'

const FALLBACK_SEARCH_QUERY = 'wallpaper'

function App() {
  const [activePage, setActivePage] = useState('search')
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchInvalid, setIsSearchInvalid] = useState(false)
  const [captionText, setCaptionText] = useState('Double click to edit')
  const [color, setColor] = useState('#1e88e5')
  const [fontSize, setFontSize] = useState(42)
  const [shapeStyle, setShapeStyle] = useState({
    from: '#1e88e5',
    mode: 'solid',
    opacity: 1,
    solid: '#1e88e5',
    to: '#7c3aed',
  })
  const {
    addShape,
    addText,
    canReleaseActiveFrame,
    canvasElementRef,
    deleteActiveObject,
    downloadImage,
    layers,
    loadImageToCanvas,
    moveActiveLayer,
    releaseActiveFrame,
    updateActiveObjectColor,
    updateActiveShapeStyle,
    updateActiveTextFontSize,
    updateActiveTextValue,
  } = useFabricCanvas({
    captionText,
    color,
    fontSize,
    onShapeStyleSelect: setShapeStyle,
    onStatusChange: setStatus,
    shapeStyle,
  })

  async function runImageSearch(searchTerm, options = {}) {
    const cleanQuery = searchTerm.trim()

    if (!cleanQuery) {
      setIsSearchInvalid(true)
      setStatus('Please enter a search term.')
      return
    }

    try {
      setIsSearching(true)
      setStatus('')
      const results = await searchUnsplashImages(cleanQuery)
      setImages(results)
      setStatus(options.silent || results.length ? '' : 'No images found for this search.')
    } catch (error) {
      setStatus(error.message || 'Something went wrong while fetching images.')
      setImages([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const defaultSearchTimer = window.setTimeout(() => {
      runImageSearch(FALLBACK_SEARCH_QUERY, { silent: true })
    }, 0)

    return () => window.clearTimeout(defaultSearchTimer)
  }, [])

  async function searchImages(event) {
    event?.preventDefault()
    await runImageSearch(query)
  }

  function handleQueryChange(value) {
    setQuery(value)
    if (isSearchInvalid && value.trim()) {
      setIsSearchInvalid(false)
      setStatus('')
    }
  }

  function handleCaptionTextChange(value) {
    setCaptionText(value)
    updateActiveTextValue(value)
  }

  function handleColorChange(value) {
    setColor(value)
    updateActiveObjectColor(value)
  }

  function handleShapeStyleChange(nextShapeStyle) {
    setShapeStyle(nextShapeStyle)
    updateActiveShapeStyle(nextShapeStyle)
  }

  function handleFontSizeChange(value) {
    setFontSize(value)
    updateActiveTextFontSize(value)
  }

  async function openEditor(image) {
    setActivePage('editor')
    await loadImageToCanvas(image)
  }

  function goToSearchPage() {
    setActivePage('search')
    setStatus('')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Caption Studio</h1>
        </div>
        {activePage === 'editor' && (
          <div className="header-actions">
            <button
              className="header-button help-button tooltip-control"
              data-tooltip="Open a quick guide for canvas tools, layers, frames, and download"
              type="button"
              onClick={() => setIsInstructionsOpen(true)}
            >
              <span aria-hidden="true" className="header-button-icon">
                <FaQuestion />
              </span>
              Canvas Instruction
            </button>
            <button
              className="header-button ghost-button tooltip-control"
              data-tooltip="Return to image search without downloading"
              type="button"
              onClick={goToSearchPage}
            >
              <span aria-hidden="true" className="header-button-icon">
                <FaArrowLeft />
              </span>
              Back to Search
            </button>
            <button
              className="header-button download-button tooltip-control"
              data-tooltip="Download the current canvas as a PNG image"
              type="button"
              onClick={downloadImage}
            >
              <span aria-hidden="true" className="header-button-icon">
                <FaDownload />
              </span>
              Download
            </button>
          </div>
        )}
      </header>

      {activePage === 'search' && (
        <>
          <section className="search-band">
            <SearchBar
              hasError={isSearchInvalid}
              isSearching={isSearching}
              query={query}
              onQueryChange={handleQueryChange}
              onSearch={searchImages}
            />
          </section>

          <section className="search-page">
            <ImageResults images={images} isLoading={isSearching} onSelectImage={openEditor} />
          </section>
        </>
      )}

      {activePage === 'editor' && (
        <>
          {isInstructionsOpen && (
            <div className="modal-backdrop" role="presentation">
              <section
                aria-labelledby="canvas-instructions-title"
                aria-modal="true"
                className="instruction-modal"
                role="dialog"
              >
                <div className="modal-header">
                  <div>
                    <p>Editor guide</p>
                    <h2 id="canvas-instructions-title">Canvas Instruction</h2>
                  </div>
                  <button
                    aria-label="Close canvas instruction"
                    className="modal-close tooltip-control"
                    data-tooltip="Close this instruction panel"
                    type="button"
                    onClick={() => setIsInstructionsOpen(false)}
                  >
                    X
                  </button>
                </div>

                <div className="instruction-grid">
                  <article>
                    <h3>Canvas Basics</h3>
                    <p>
                      Click any image, text, or shape to select it. Drag to move it, use the corner
                      handles to resize it, and use the rotate handle to turn it.
                    </p>
                  </article>
                  <article>
                    <h3>Text Tools</h3>
                    <p>
                      Click Text to add a caption. Select a text layer, then use Text color and Size
                      to change its color and font size.
                    </p>
                  </article>
                  <article>
                    <h3>Shape Tools</h3>
                    <p>
                      Use Rectangle, Circle, Triangle, or Polygon to add shapes. Background changes
                      the fill color, gradient, and opacity for selected shapes and new shapes.
                    </p>
                  </article>
                  <article>
                    <h3>Image Frames</h3>
                    <p>
                      Drag an image over a shape to place the image inside it. Select the framed
                      image or shape, then click Release to separate them again.
                    </p>
                  </article>
                  <article>
                    <h3>Layer Order</h3>
                    <p>
                      Select a layer first. B moves it behind everything, - moves it back one step, +
                      moves it forward one step, and F brings it to the front.
                    </p>
                  </article>
                  <article>
                    <h3>Finish</h3>
                    <p>
                      Select a layer and click Delete to remove it. Click Download when your design
                      is ready to save it as a PNG file.
                    </p>
                  </article>
                </div>
              </section>
            </div>
          )}
          {status && <p className="editor-status status">{status}</p>}
          <section className="editor-workspace">
            <CanvasEditor
              canvasRef={canvasElementRef}
              canReleaseActiveFrame={canReleaseActiveFrame}
              captionText={captionText}
              color={color}
              fontSize={fontSize}
              layers={layers}
              shapeStyle={shapeStyle}
              onAddShape={addShape}
              onAddText={addText}
              onCaptionTextChange={handleCaptionTextChange}
              onColorChange={handleColorChange}
              onDeleteActiveObject={deleteActiveObject}
              onFontSizeChange={handleFontSizeChange}
              onMoveActiveLayer={moveActiveLayer}
              onReleaseActiveFrame={releaseActiveFrame}
              onShapeStyleChange={handleShapeStyleChange}
            />
          </section>
        </>
      )}
    </main>
  )
}

export default App
