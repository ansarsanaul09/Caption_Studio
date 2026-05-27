const skeletonItems = Array.from({ length: 10 }, (_, index) => index)

function ImageSkeletonGrid() {
  return (
    <aside className="result-panel skeleton-grid" aria-label="Loading image results">
      {skeletonItems.map((item) => (
        <article className="image-skeleton" key={item}>
          <div className="skeleton-media" />
          <div className="skeleton-line" />
        </article>
      ))}
    </aside>
  )
}

export default ImageSkeletonGrid
