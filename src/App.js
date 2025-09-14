import './App.css';
import { useState } from 'react';
import InputPanel from './components/InputPanel.jsx';
import FormattedPanel from './components/FormattedPanel.jsx';
import Treemap from './components/Treemap.jsx';

function App() {
  const [input, setInput] = useState('');
  const [treemapHeight, setTreemapHeight] = useState(480); // px height
  const [treemapWidth, setTreemapWidth] = useState(928); // px width (scrolls if wider than page)
  const [labelFontSize, setLabelFontSize] = useState(11); // px font size for treemap labels
  // Parse on every render; avoid memoization/persistence
  let formatted = '';
  let error = '';
  let data = null;
  if (input.trim()) {
    try {
      const parsed = JSON.parse(input);
      formatted = JSON.stringify(parsed, null, 2);
      data = parsed;
    } catch (e) {
      error = e.message;
    }
  }

 

  return (
    <div className="App" style={{ padding: 24, textAlign: 'left' }}>
      <h1>JSON Formatter & Visualizer</h1>
      <p style={{ color: '#555', marginTop: -8 }}>Paste a JSON string below.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <InputPanel value={input} onChange={setInput} error={error} />
      </div>

      <FormattedPanel data={data} formatted={formatted} />

      {data && (
        <div style={{ marginTop: 24 }}>
          <label style={{ fontWeight: 600, display: 'block' }}>Treemap</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#333' }}>Size:</span>
            <button
              type="button"
              onClick={() => setTreemapWidth((w) => Math.max(320, w - 120))}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
              aria-label="Decrease treemap width"
            >
              − Width
            </button>
            <button
              type="button"
              onClick={() => setTreemapWidth((w) => Math.min(2400, w + 120))}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
              aria-label="Increase treemap width"
            >
              + Width
            </button>
            <button
              type="button"
              onClick={() => setTreemapHeight((h) => Math.max(240, h - 80))}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
              aria-label="Decrease treemap height"
            >
              − Height
            </button>
            <button
              type="button"
              onClick={() => setTreemapHeight((h) => Math.min(1600, h + 80))}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
              aria-label="Increase treemap height"
            >
              + Height
            </button>
            <span style={{ color: '#6b7280', fontSize: 12 }}>{treemapWidth} × {treemapHeight} px</span>
            <span style={{ marginLeft: 12, color: '#333' }}>Font:</span>
            <input
              type="range"
              min={8}
              max={24}
              step={1}
              value={labelFontSize}
              onChange={(e) => setLabelFontSize(parseInt(e.target.value, 10))}
              aria-label="Treemap font size"
            />
            <span style={{ color: '#6b7280', fontSize: 12 }}>{labelFontSize}px</span>
          </div>
          <div style={{ width: treemapWidth, height: treemapHeight, minHeight: 240, marginTop: 8 }}>
            <Treemap data={data} height={treemapHeight} width={treemapWidth} fontSize={labelFontSize} />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
