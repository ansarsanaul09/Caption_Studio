function SearchBar({ query, hasError, isSearching, onQueryChange, onSearch }) {
  return (
    <form className="search-form" onSubmit={onSearch}>
      <div>
        <div className="search-input-wrap">
          <input
            aria-invalid={hasError}
            className={hasError ? 'input-error' : undefined}
            id="image-query"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try nature, city, food..."
          />
          {query && (
            <button
              aria-label="Clear search text"
              className="clear-search-button tooltip-control"
              data-tooltip="Clear search text"
              type="button"
              onClick={() => onQueryChange('')}
            >
              X
            </button>
          )}
        </div>
        <button
          aria-label={isSearching ? 'Searching images' : 'Search images'}
          className={
            isSearching
              ? 'search-button is-loading tooltip-control'
              : 'search-button tooltip-control'
          }
          data-tooltip="Search Unsplash for images using your typed keyword"
          type="submit"
          disabled={isSearching}
        >
          {isSearching ? <span aria-hidden="true" className="button-spinner" /> : 'Search'}
        </button>
      </div>
    </form>
  )
}

export default SearchBar
