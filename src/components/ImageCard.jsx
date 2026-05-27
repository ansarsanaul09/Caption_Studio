function ImageCard({ image, onAddCaptions }) {
  const altText = image.alt_description || image.description || 'Unsplash result'

  return (
    <article className="image-result">
      <img src={image.urls.small} alt={altText} />
      <div className="image-meta">
        <p>{image.user.name}</p>
      </div>
      <div className="image-action">
        <button type="button" onClick={() => onAddCaptions(image)}>
          Add Caption
        </button>
      </div>
    </article>
  )
}

export default ImageCard
