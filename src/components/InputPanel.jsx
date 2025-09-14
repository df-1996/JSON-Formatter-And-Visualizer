import React from 'react';

export default function InputPanel({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="json-input" style={{ fontWeight: 600 }}>Input</label>
      <textarea
        id="json-input"
        placeholder='{"hello":"world"}'
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          width: '100%',
          height: 200,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 14,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ddd',
          boxSizing: 'border-box',
          resize: 'none',
          overflow: 'auto',
        }}
      />
      {error && (
        <div role="alert" style={{ color: '#b00020', marginTop: 8 }}>
          Parse error: {error}
        </div>
      )}
    </div>
  );
}

