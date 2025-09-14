// Convert JSON to a d3.hierarchy-friendly structure
// Arrays of primitive values are labeled by the primitive, not index
export function jsonToHierarchy(value, name = 'root') {
  if (Array.isArray(value) && value.length === 0) {
    value = '[]';
    return { name, value };
  }


  if (value !== null && typeof value === 'object') {
    if (Array.isArray(value)) {
      const isPrimitive = (v) => v === null || typeof v !== 'object';
      const asLabel = (v) => (v === null ? 'null' : String(v));
      const allPrimitives = value.every(isPrimitive);
      if (allPrimitives) {
        return {
          name,
          children: value.map((v) => ({ name: asLabel(v), value: 1 })),
        };
      }
      const entries = value.map((v, i) => [String(i), v]);
      return { name, children: entries.map(([k, v]) => jsonToHierarchy(v, k)) };
    }
    const entries = Object.entries(value);
    return { name, children: entries.map(([k, v]) => jsonToHierarchy(v, k)) };
  }
  return { name, value };
}

export default jsonToHierarchy;

