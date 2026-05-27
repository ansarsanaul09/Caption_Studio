import axios from 'axios'

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const UNSPLASH_API_URL = 'https://api.unsplash.com'

export function hasUnsplashAccessKey() {
  return Boolean(UNSPLASH_ACCESS_KEY)
}

export async function searchUnsplashImages(query, options = {}) {
  try {
    const cleanQuery = query.trim()

    if (!cleanQuery) {
      throw new Error('Please enter a search term.')
    }

    if (!hasUnsplashAccessKey()) {
      throw new Error('Add VITE_UNSPLASH_ACCESS_KEY to your .env file to search Unsplash.')
    }

    const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
      params: {
        query: cleanQuery,
        per_page: options.perPage ?? 30,
        orientation: options.orientation ?? 'landscape',
        client_id: UNSPLASH_ACCESS_KEY,
      },
    })

    return response.data.results ?? []
  } catch (error) {
    throw new Error(getUnsplashErrorMessage(error), { cause: error })
  }
}

export async function triggerUnsplashDownload(image) {
  try {
    const downloadLocation = image?.links?.download_location

    if (!downloadLocation || !hasUnsplashAccessKey()) {
      return
    }

    await axios.get(downloadLocation, {
      params: {
        client_id: UNSPLASH_ACCESS_KEY,
      },
    })
  } catch (error) {
    throw new Error(getUnsplashErrorMessage(error), { cause: error })
  }
}

function getUnsplashErrorMessage(error) {
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors.join(' ')
  }

  if (error.response?.status) {
    return `Unsplash request failed with ${error.response.status}`
  }

  return error.message || 'Something went wrong while contacting Unsplash.'
}
