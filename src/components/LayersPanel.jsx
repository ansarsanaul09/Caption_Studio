import { useMemo } from 'react'

function LayersPanel({ layers }) {
  const layerSummary = useMemo(() => JSON.stringify(layers, null, 2), [layers])

  return (
    <aside className="layers-panel">
      <div className="layers-panel-header">
        <h2>Canvas Layers</h2>
        <span>{layers.length}</span>
      </div>
      <pre>{layerSummary}</pre>
    </aside>
  )
}

export default LayersPanel
