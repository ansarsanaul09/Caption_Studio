import { useEffect, useState } from 'react'
import CanvasEditor from './components/CanvasEditor'
import ImageResults from './components/ImageResults'
import SearchBar from './components/SearchBar'
import useFabricCanvas from './hooks/useFabricCanvas'
import { searchUnsplashImages } from './services/unsplashApi'
import './App.css'

const FALLBACK_SEARCH_QUERY = 'wallpaper'

function App() {
  const [activePage, setActivePage] = useState('search')
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchInvalid, setIsSearchInvalid] = useState(false)
  const [captionText, setCaptionText] = useState('Double click to edit')
  const [color, setColor] = useState('#1e88e5')
  const [fontSize, setFontSize] = useState(42)
  const {
    addShape,
    addText,
    canReleaseActiveFrame,
    canvasElementRef,
    deleteActiveObject,
    downloadImage,
    loadImageToCanvas,
    releaseActiveFrame,
    updateActiveObjectColor,
    updateActiveTextFontSize,
    updateActiveTextValue,
  } = useFabricCanvas({
    captionText,
    color,
    fontSize,
    onStatusChange: setStatus,
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
            <button className="header-button ghost-button" type="button" onClick={goToSearchPage}>
              <span aria-hidden="true">←</span>
              Back to Search
            </button>
            <button className="header-button download-button" type="button" onClick={downloadImage}>
              <span aria-hidden="true">↓</span>
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
          {status && <p className="editor-status status">{status}</p>}
          <section className="editor-workspace">
            <CanvasEditor
              canvasRef={canvasElementRef}
              canReleaseActiveFrame={canReleaseActiveFrame}
              captionText={captionText}
              color={color}
              fontSize={fontSize}
              onAddShape={addShape}
              onAddText={addText}
              onCaptionTextChange={handleCaptionTextChange}
              onColorChange={handleColorChange}
              onDeleteActiveObject={deleteActiveObject}
              onFontSizeChange={handleFontSizeChange}
              onReleaseActiveFrame={releaseActiveFrame}
            />
          </section>
        </>
      )}
    </main>
  )
}

export default App
