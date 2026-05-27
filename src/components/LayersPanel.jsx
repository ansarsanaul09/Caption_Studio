import { useMemo } from 'react'

function LayersPanel({ layers }) {
  const layerSummary = useMemo(() => JSON.stringify(layers, null, 2), [layers])

  return (
    <aside className="layers-panel">
      <h2>Layers</h2>
      <pre>{layerSummary}</pre>
    </aside>
  )
}

export default LayersPanel
