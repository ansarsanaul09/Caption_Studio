# Image Caption Studio Roadmap

## Important API Key Note

Use only the Unsplash **Access Key** in the frontend Vite app:

```env
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

Do not use or expose the Unsplash **Secret Key** in React, browser code, GitHub, CodeSandbox, or any deployed frontend. The secret key is only for backend/server-side use.

## Objective

Build a production-ready React web application that allows users to search Unsplash images, load a selected image into a Fabric.js canvas, add editable captions and shapes, manage layers, and download the final edited image.

Fabric.js is mandatory for this project and will be used for:

- Loading the selected image into a canvas.
- Adding editable text objects.
- Adding rectangle, circle, triangle, and polygon shapes.
- Moving, resizing, rotating, selecting, and deleting objects.
- Exporting the final canvas as a downloadable image.
- Reading canvas objects for the layer debug panel.

## Final Application Flow

```text
User searches Unsplash
        |
        v
Images appear in result grid
        |
        v
User clicks Add Captions
        |
        v
Image loads into Fabric.js canvas
        |
        v
User adds text and shapes
        |
        v
Canvas layer array updates dynamically
        |
        v
User downloads edited image
```

## Recommended Project Structure

```text
src/
  App.jsx
  App.css
  index.css
  main.jsx

  components/
    AppHeader.jsx
    SearchBar.jsx
    ImageResults.jsx
    ImageCard.jsx
    EditorToolbar.jsx
    CanvasEditor.jsx
    LayersPanel.jsx
    StatusMessage.jsx

  hooks/
    useUnsplashSearch.js
    useFabricCanvas.js
    useCanvasLayers.js

  services/
    unsplashApi.js

  utils/
    canvasLayers.js
    canvasObjects.js
    downloadCanvas.js

  constants/
    canvas.js
    shapes.js
```

## Component Responsibilities

### `App.jsx`

Main page composition and state ownership.

Responsibilities:

- Store selected image.
- Store app-level status message.
- Connect search results with canvas editor.
- Compose layout sections.

### `AppHeader.jsx`

Top app header.

Responsibilities:

- Show app title.
- Show primary download action.
- Keep download button visually accessible.

### `SearchBar.jsx`

Reusable search form.

Props:

- `query`
- `onQueryChange`
- `onSearch`
- `isSearching`

Responsibilities:

- Validate empty input at UI level.
- Submit search request.
- Disable button while loading.

### `ImageResults.jsx`

Search result grid/list wrapper.

Props:

- `images`
- `onSelectImage`

Responsibilities:

- Render all image results.
- Show empty state when needed.

### `ImageCard.jsx`

Single reusable image result card.

Props:

- `image`
- `onAddCaptions`

Responsibilities:

- Show image preview.
- Show photographer name.
- Trigger image selection.

### `EditorToolbar.jsx`

Canvas tools panel.

Props:

- `captionText`
- `onCaptionTextChange`
- `color`
- `onColorChange`
- `onAddText`
- `onAddShape`
- `onDeleteActiveObject`

Responsibilities:

- Add text.
- Add rectangle, circle, triangle, polygon.
- Select color.
- Delete selected object.

### `CanvasEditor.jsx`

Fabric.js canvas container.

Props:

- `selectedImage`
- `onLayersChange`
- `onStatusChange`

Responsibilities:

- Initialize and dispose Fabric.js canvas.
- Load selected image.
- Add/manipulate Fabric objects.
- Expose canvas actions to parent or toolbar.

### `LayersPanel.jsx`

Debug/transparency panel.

Props:

- `layers`

Responsibilities:

- Render the live array of Fabric canvas objects.
- Show object type, position, size, angle, fill, stroke, and text.

### `StatusMessage.jsx`

Reusable feedback message.

Props:

- `message`
- `type`

Responsibilities:

- Show validation, API, and canvas feedback.

## Hooks

### `useUnsplashSearch.js`

Handles Unsplash API state.

Returns:

- `query`
- `setQuery`
- `images`
- `isSearching`
- `error`
- `searchImages`

Responsibilities:

- Validate search query.
- Call Unsplash API service.
- Normalize response data.
- Handle API errors.

### `useFabricCanvas.js`

Owns Fabric.js lifecycle and canvas actions.

Returns:

- `canvasRef`
- `loadImage`
- `addText`
- `addShape`
- `deleteActiveObject`
- `downloadCanvas`

Responsibilities:

- Create Fabric canvas.
- Dispose canvas on unmount.
- Keep image as bottom layer.
- Keep shapes above image.
- Keep text above shapes.
- Handle download export.

### `useCanvasLayers.js`

Tracks canvas objects.

Responsibilities:

- Listen to Fabric object events.
- Convert Fabric objects into a clean array.
- Update layer debug panel.

## Services

### `unsplashApi.js`

Unsplash network layer.

Functions:

```js
searchUnsplashImages(query)
triggerUnsplashDownload(downloadLocation)
```

Responsibilities:

- Build Unsplash URLs.
- Attach `VITE_UNSPLASH_ACCESS_KEY`.
- Throw useful errors for failed requests.
- Trigger Unsplash download tracking endpoint when an image is selected.

## Utilities

### `canvasObjects.js`

Reusable Fabric object factory functions.

Functions:

```js
createCaption(text, color)
createRectangle(color)
createCircle(color)
createTriangle(color)
createPolygon(color)
```

### `canvasLayers.js`

Layer ordering and layer serialization.

Functions:

```js
enforceLayerOrder(canvas)
extractLayers(canvas)
```

### `downloadCanvas.js`

Canvas export helper.

Function:

```js
downloadCanvasAsPng(canvas, filename)
```

## Phased Build Plan

## Phase 1: Foundation

Goal: Replace starter template with clean project foundation.

Tasks:

- Set up React + Vite app layout.
- Add environment variable support.
- Add Unsplash access key documentation.
- Add Fabric.js script or package dependency.
- Create base CSS theme and responsive layout.

Completion criteria:

- App opens successfully.
- `.env.example` explains required key.
- Fabric.js is available in the browser.

## Phase 2: Unsplash Search

Goal: Build image search experience.

Tasks:

- Create `services/unsplashApi.js`.
- Create `components/SearchBar.jsx`.
- Create `components/ImageResults.jsx`.
- Create `components/ImageCard.jsx`.
- Add loading state.
- Add empty query validation.
- Add no-results state.
- Add failed request error handling.

Completion criteria:

- User can search Unsplash.
- Image cards render correctly.
- Each result has an `Add Captions` button.

## Phase 3: Fabric.js Canvas Editor

Goal: Load selected image into Fabric.js canvas.

Tasks:

- Create `components/CanvasEditor.jsx`.
- Create `hooks/useFabricCanvas.js`.
- Initialize Fabric canvas.
- Load selected Unsplash image with `crossOrigin: "anonymous"`.
- Scale image to fit canvas.
- Lock base image from dragging.
- Track selected image state.

Completion criteria:

- Clicking `Add Captions` loads image into canvas.
- Image appears as base layer.
- Canvas does not break on image load failure.

## Phase 4: Text and Shape Tools

Goal: Add all required editable layers.

Tasks:

- Create `components/EditorToolbar.jsx`.
- Create Fabric object factory helpers.
- Add editable text box.
- Add rectangle.
- Add circle.
- Add triangle.
- Add polygon.
- Add color selector.
- Add delete selected object.

Completion criteria:

- Text can be added, edited, resized, moved, and rotated.
- All required shapes can be added, resized, moved, and rotated.
- User cannot accidentally delete the base image.

## Phase 5: Layer Management and Debug Panel

Goal: Implement bonus layer logging.

Tasks:

- Create `components/LayersPanel.jsx`.
- Create `hooks/useCanvasLayers.js`.
- Create `utils/canvasLayers.js`.
- Enforce layer order:

```text
Image
Shapes
Text
```

- Render live JSON array of layers.
- Update layer data on add, modify, remove, and selection events.

Completion criteria:

- Layer panel updates dynamically.
- Layer attributes include object type, position, dimensions, colors, and text.
- Text remains visually above shapes.

## Phase 6: Download Feature

Goal: Export final edited canvas.

Tasks:

- Add download action in header or beside canvas.
- Create `utils/downloadCanvas.js`.
- Export Fabric canvas using `canvas.toDataURL`.
- Download as PNG.
- Validate selected image before download.
- Handle export failures.

Completion criteria:

- Download button saves the edited canvas image.
- Downloaded image includes base image, shapes, and captions.

## Phase 7: UI Polish and Responsiveness

Goal: Make the app look complete and submission-ready.

Tasks:

- Improve spacing, alignment, and responsive behavior.
- Keep result list scrollable on desktop.
- Keep canvas usable on smaller screens.
- Ensure buttons and text fit properly.
- Add clear status messages.

Completion criteria:

- App is usable on desktop and mobile widths.
- UI looks like a finished assignment project.
- No overlapping text or broken layout.

## Phase 8: Testing and Submission

Goal: Prepare for final delivery.

Tasks:

- Run lint.
- Run production build.
- Test search with valid and invalid queries.
- Test image selection.
- Test text editing.
- Test all shapes.
- Test layer logging.
- Test PNG download.
- Update README instructions.
- Deploy to CodeSandbox, CodePen, Netlify, or Vercel.

Completion criteria:

- `npm run lint` passes.
- `npm run build` passes.
- Deployed link works.
- README includes setup and usage instructions.

## Current Implementation Status

Already implemented in the first working version:

- Unsplash search using `VITE_UNSPLASH_ACCESS_KEY`.
- Fabric.js canvas integration.
- Image loading into canvas.
- Text tool.
- Rectangle, circle, triangle, and polygon tools.
- Delete selected object.
- Download as PNG.
- Live layer JSON panel.
- Basic responsive layout.
- README setup instructions.

Next recommended step:

- Refactor current single-file implementation into the component and hook structure above.

## Refactor Order

To keep the app working after every step, refactor in this order:

1. Extract Unsplash API calls into `services/unsplashApi.js`.
2. Extract `SearchBar`, `ImageResults`, and `ImageCard`.
3. Extract layer utilities into `utils/canvasLayers.js`.
4. Extract Fabric object factories into `utils/canvasObjects.js`.
5. Extract `EditorToolbar`.
6. Extract `LayersPanel`.
7. Extract Fabric canvas behavior into `useFabricCanvas`.
8. Keep `App.jsx` focused on layout and state coordination.

## Quality Standards

Code should be written at a 2.5-year software engineer level:

- Component-based architecture.
- Small reusable functions.
- Clear prop names.
- Single-responsibility components.
- API logic separated from UI.
- Canvas object creation separated from event handling.
- Meaningful error messages.
- No exposed secret key.
- No large unrelated refactors.
- Working app after every phase.

## Deployment Notes

For Vercel or Netlify:

- Add `VITE_UNSPLASH_ACCESS_KEY` in project environment variables.
- Redeploy after adding the key.

For CodeSandbox:

- Add the key in the environment/secrets panel if available.
- If using a public sandbox, do not add the Unsplash secret key.

For CodePen:

- Frontend environment variables are not private.
- Use only the Unsplash access key if required for assignment demo.
- Never paste the secret key.
