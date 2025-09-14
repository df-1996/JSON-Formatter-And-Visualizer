import React, {useRef, useState } from 'react';
import JsonViewer from './JsonViewer.jsx';

export default function FormattedPanel({ data, formatted }) {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'pretty' | 'raw'
  const [search, setSearch] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [formattedHeight, setFormattedHeight] = useState(480);
  const resizeStateRef = useRef({ startY: 0, startH: 0 });
  const [resizeHover, setResizeHover] = useState(false);


  const beginResize = (e) => {
    resizeStateRef.current.startY = e.clientY;
    resizeStateRef.current.startH = formattedHeight;
    const onMove = (ev) => {
      const delta = ev.clientY - resizeStateRef.current.startY;
      const nh = Math.max(
        240,
        Math.min(
          typeof window !== 'undefined' ? window.innerHeight - 120 : 1000,
          resizeStateRef.current.startH + delta
        )
      );
      setFormattedHeight(nh);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  };

  const handleResizeKey = (e) => {
    const maxH = typeof window !== 'undefined' ? window.innerHeight - 120 : 1000;
    const step = e.shiftKey ? 48 : 24;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFormattedHeight((h) => Math.max(240, h - step));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFormattedHeight((h) => Math.min(maxH, h + step));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      setFormattedHeight((h) => Math.max(240, h - 120));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      setFormattedHeight((h) => Math.min(maxH, h + 120));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFormattedHeight(240);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFormattedHeight(maxH);
    }
  };

  const handleCopy = async () => {
    try {
      let text = '';
      if (data) {
        if (viewMode === 'raw') text = JSON.stringify(data);
        else text = JSON.stringify(data, null, 2);
      } else {
        text = formatted || '';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {}
  };

  const jsonApiRef = useRef(null);

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ fontWeight: 600, display: 'block' }}>Formatted</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px', flexWrap: 'wrap' }}>
        <label htmlFor="view-mode" style={{ color: '#333' }}>View:</label>
        <select
          id="view-mode"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{ padding: '2px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fff' }}
        >
          <option value="tree">Tree</option>
          <option value="pretty">Pretty</option>
          <option value="raw">Raw</option>
        </select>
        {viewMode === 'tree' && (
          <>
            <input
              type="search"
              placeholder="Search keys/values"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '4px 8px', border: '1px solid #ddd', background: '#fff', color: '#111827', borderRadius: 4, minWidth: 180 }}
            />
            {search && (
              <span style={{ color: '#6b7280', fontSize: 12 }}>{matchCount} results</span>
            )}
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </>
        )}
        {viewMode === 'tree' && (
          <>
            <button
              type="button"
              onClick={() => jsonApiRef.current && jsonApiRef.current.expandAll && jsonApiRef.current.expandAll()}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => jsonApiRef.current && jsonApiRef.current.collapseAll && jsonApiRef.current.collapseAll()}
              style={{ padding: '2px 8px', border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
            >
              Collapse all
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy JSON"
          style={{ padding: '2px 8px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
        >
          Copy
        </button>
      </div>
      <div aria-label="formatted-output" style={{ width: '100%', height: formattedHeight, minHeight: 240 }}>
        {data ? (
          viewMode === 'tree' ? (
            <JsonViewer
              data={data}
              apiRef={jsonApiRef}
              showExpandCollapse={false}
              showSearch={false}
              searchQuery={search}
              onMatchCount={setMatchCount}
            />
          ) : (
            <pre
              style={{
                width: '100%',
                height: '100%',
                margin: 0,
                overflow: 'auto',
                background: '#0b1021',
                color: '#d6deeb',
                borderRadius: 8,
                border: '1px solid #0b1021',
                padding: 12,
                boxSizing: 'border-box',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre',
              }}
            >
              {viewMode === 'raw' ? JSON.stringify(data) : JSON.stringify(data, null, 2)}
            </pre>
          )
        ) : (
          <pre
            style={{
              width: '100%',
              height: '100%',
              margin: 0,
              overflow: 'auto',
              background: '#0b1021',
              color: '#d6deeb',
              borderRadius: 8,
              border: '1px solid #0b1021',
              padding: 12,
              boxSizing: 'border-box',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: 'pre',
            }}
          >
            {formatted}
          </pre>
        )}
      </div>
      <div
        onMouseDown={beginResize}
        onKeyDown={handleResizeKey}
        onMouseEnter={() => setResizeHover(true)}
        onMouseLeave={() => setResizeHover(false)}
        role="separator"
        aria-orientation="horizontal"
        aria-valuemin={240}
        aria-valuemax={typeof window !== 'undefined' ? Math.max(240, window.innerHeight - 120) : 1000}
        aria-valuenow={formattedHeight}
        aria-label="Drag to resize formatted panel"
        tabIndex={0}
        title="Drag or press Arrow keys to resize"
        style={{
          height: 20,
          marginTop: 6,
          marginBottom: 6,
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 44,
            height: 6,
            background: resizeHover ? '#94a3b8' : '#cbd5e1',
            border: '1px solid #cfd8e3',
            borderRadius: 9999,
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          }}
        />
      </div>
    </div>
  );
}
