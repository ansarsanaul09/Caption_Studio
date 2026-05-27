import ImageCard from './ImageCard'
import ImageSkeletonGrid from './ImageSkeletonGrid'

function ImageResults({ images, isLoading, onSelectImage }) {
  if (isLoading) {
    return <ImageSkeletonGrid />
  }

  if (!images.length) {
    return (
      <aside className="result-panel empty-results" aria-label="Search results">
        <p>Search for images to start editing.</p>
      </aside>
    )
  }

  return (
    <aside className="result-panel" aria-label="Search results">
      {images.map((image) => (
        <ImageCard image={image} key={image.id} onAddCaptions={onSelectImage} />
      ))}
    </aside>
  )
}

export default ImageResults
