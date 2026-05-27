# Image Caption Studio

A React + Vite web app that searches Unsplash images, opens a selected image in a Fabric.js canvas, adds editable captions and shapes, and downloads the final composition.

## Setup

1. Create an Unsplash developer app and copy the access key.
2. Create a `.env` file in the project root:

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

3. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Features

- Unsplash image search with empty-query and API error feedback.
- Search result cards with an `Add Captions` action.
- Fabric.js canvas with the selected image as the base layer.
- Editable text layers and rectangle, circle, triangle, and polygon shapes.
- Drag, resize, rotate, delete, and reposition canvas layers.
- Text is kept above shapes, and shapes stay above the base image.
- PNG download of the edited canvas.
- Live layer log showing object type, position, size, colors, and text.

## Layout Sketch

```text
Header: Image Caption Studio                         [Download]

[ Search images input                         ] [Search]

+ Results column +   + Toolbar: text, color, shapes, delete +
| image card     |   |                                  |
| Add Captions   |   |             Canvas               |   + Layer JSON +
| image card     |   |                                  |
```
