# JSON Formatter & Visualizer

Paste any JSON and instantly:

- Pretty‑print it
- Explore it as an interactive tree with search and expand/collapse
- Visualize its structure as a D3 treemap

This app is built with React and D3 and bootstrapped with Create React App.

## Features

- Live JSON parse with inline error feedback
- Three views: Tree, Pretty (indented JSON), and Raw (compact JSON)
- Tree view: expand/collapse, search across keys and values, live match count
- Copy to clipboard for any view
- Resizable formatted panel (mouse drag or keyboard: Arrow/PageUp/PageDown/Home/End)
- Treemap visualization (D3):
  - Colors by top‑level groups, with subtle depth-based shading
  - Labels show key names and either leaf counts or values
  - Arrays of primitives are visualized as equal‑sized leaves, labeled by the primitive values
  - Adjustable width, height, and label font size

## Quick Start

Prerequisites: Node.js and npm installed.

```bash
npm install
npm start
```

Open http://localhost:3000 and paste a JSON string.

## Scripts

- `npm start`: Run the app in development mode
- `npm test`: Launch the test runner (Jest + Testing Library)
- `npm run build`: Create a production build in the `build/` folder
- `npm run eject`: Eject CRA configs (one‑way)

## Usage

1. Paste JSON into the Input panel. Parsing happens as you type.
2. Use the Formatted panel to switch between Tree, Pretty, or Raw views.
   - In Tree view, use the search box to filter keys/values. Use Expand all/Collapse all as needed.
   - Click Copy to copy the current representation to your clipboard.
3. If the JSON is valid, the Treemap section appears. Adjust size and font using the provided controls.

Example JSON to try:

```json
{
  "name": "Acme Co",
  "employees": [
    { "id": 1, "name": "Alice", "roles": ["dev", "admin"] },
    { "id": 2, "name": "Bob", "roles": ["design"] }
  ],
  "active": true,
  "count": 2
}
```

## How It Works

- Tree/Pretty/Raw: The app parses your input with `JSON.parse` and renders either a custom tree viewer or stringified JSON (`JSON.stringify`).
- Treemap: The JSON data is converted to a D3 hierarchy and rendered via `d3.treemap`. Leaves are weighted equally. Arrays of primitive values (e.g., `["a", "b"]`) are treated as equally sized leaves with labels derived from their values.

Key files:

- `src/components/Treemap.jsx`: D3 treemap rendering
- `src/utils/jsonToHierarchy.js`: Converts JSON to a D3‑friendly hierarchy
- `src/components/JsonViewer.jsx`: Interactive JSON tree with search and expand/collapse
- `src/components/FormattedPanel.jsx`: Toolbar, copy action, resizable formatted output
- `src/components/InputPanel.jsx`: Input textarea and parse error display
- `src/App.js`: Top‑level composition and treemap controls

## Tech Stack

- React 19
- D3 v7
- Create React App (react-scripts)
- Testing Library (React, DOM, Jest‑DOM)

## Accessibility

- Keyboard support for resizing the formatted panel (Arrow keys, PageUp/Down, Home/End)
- ARIA roles/labels on interactive UI and charts

## Building For Production

```bash
npm run build
```

Outputs a production build to `build/` ready for deployment to static hosts.

## Project Structure (excerpt)

```
src/
  components/
    InputPanel.jsx
    FormattedPanel.jsx
    JsonViewer.jsx
    Treemap.jsx
  utils/
    jsonToHierarchy.js
  App.js
  index.js
```

## Contributing

Issues and pull requests are welcome. If you have ideas or find bugs, please open an issue.

