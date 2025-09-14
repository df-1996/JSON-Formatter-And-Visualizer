import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import jsonToHierarchy from '../utils/jsonToHierarchy';

// Treemap visualization of arbitrary JSON
// Renders into an SVG that fills the parent container size
export default function Treemap({ data, width = undefined, height = 480, fontSize = 10 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous render
    while (el.firstChild) el.removeChild(el.firstChild);

    if (!data) return;

    // Dimensions
    const w = Math.max(1, Math.floor(width || el.clientWidth || 928));
    const h = Math.max(1, Math.floor(height || 480));

    // Build hierarchy from JSON, counting each leaf equally
    const rootData = jsonToHierarchy(data, 'root');
    const root = d3
      .treemap()
      .size([w, h])
      .paddingOuter(3)
      .paddingTop(18)
      .paddingInner(1)
      .round(true)(
        d3
          .hierarchy(rootData)
          .sum((d) => (d && d.children ? 0 : 1))
          .sort((a, b) => (b.value || 0) - (a.value || 0))
      );

    // Color by top-level group using a pleasant categorical palette,
    // then vary brightness slightly by depth for contrast.
    const groupColor = d3.scaleOrdinal(d3.schemeTableau10);
    const nodeFill = (d) => {
      const a1 = d.ancestors().reverse()[1] || d; // top-level ancestor
      const base = groupColor(a1?.data?.name || 'root');
      const c = d3.color(base);
      if (!c) return base;
      const depthAdj = Math.max(0, d.depth - 1) * 0.35;
      return (d.children ? c.darker(depthAdj) : c.brighter(depthAdj)).toString();
    };

    // SVG root
    const svg = d3
      .create('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('viewBox', [0, 0, w, h])
      .attr(
        'style',
        `max-width: 100%; height: 100%; overflow: visible; font: ${fontSize}px sans-serif;`
      );

    // Title/header for the chart (top padding allows space for this)
    svg
      .append('text')
      .attr('x', 4)
      .attr('y', 12)
      .attr('fill', '#334155')
      .attr('font-weight', 600)
      .text('Treemap');

    const nodes = root.descendants();


    const g = svg
      .selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Tooltip with path, leaf count, and value (for non-primitive-array leaves)
    const format = d3.format(',d');
    const tooltipValue = (node) => {
      // Show original value for leaf nodes when meaningful
      if (!node || node.children) return '';
      const p = node.parent;
      const isPrimArray =
        p && p.data && Array.isArray(p.data.children) && p.data.children.every((ch) => ch && !ch.children && ch.value === 1);
      if (isPrimArray) return '';
      const v = node.data ? node.data.value : undefined;
      const vStr = v === null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v);
      return ` = ${vStr}`;
    };
    const titleText = (d) => {
      const path = d
        .ancestors()
        .reverse()
        .map((n) => (n.data && n.data.name != null ? String(n.data.name) : ''))
        .filter(Boolean)
        .join('/');
      return `${path}${tooltipValue(d)}\n${format(d.value || 0)}`;
    };
    g.append('title').text(titleText);

    // Rectangles
    g.append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d) => nodeFill(d))
      .attr('stroke', 'rgba(255,255,255,0.4)')
      .attr('stroke-width', 0.5);

    // Text now wraps inside foreignObject; no clipPath needed

    // Labels (wrapped via foreignObject for HTML text)
    const isPrimitiveArrayLeaf = (node) => {
      if (!node || node.children) return false;
      const p = node.parent;
      if (!p || !p.data || !Array.isArray(p.data.children)) return false;
      return p.data.children.every((ch) => ch && !ch.children && ch.value === 1);
    };

    const textColor = (d) => {
      const c = d3.color(nodeFill(d));
      if (!c) return '#111827';
      const L = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255; // relative luminance
      return L > 0.6 ? '#111827' : '#f8fafc';
    };

    const fo = g
      .append('foreignObject')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0));

    const div = fo
      .append('xhtml:div')
      .style('width', '100%')
      .style('height', '100%')
      .style('padding', '3px')
      .style('box-sizing', 'border-box')
      .style('overflow', 'hidden')
      .style('line-height', '1.1')
      .style('word-wrap', 'break-word')
      .style('word-break', 'break-word')
      .style('overflow-wrap', 'anywhere')
      .style('white-space', 'normal')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('justify-content', 'flex-start')
      .style('color', (d) => textColor(d))
      .style('font', `${fontSize}px sans-serif`)
      .style('user-select', 'text')
      .attr('title', (d) => titleText(d));

    // Construct label content per node with wrapping
    div.each(function (d) {
      const container = d3.select(this);
      const name = d.data && d.data.name != null ? String(d.data.name) : '';
      if (name) {
        container
          .append('xhtml:div')
          .style('font-weight', d.children ? 600 : 400)
          .text(name);
      }

      if (d.children) {
        container
          .append('xhtml:div')
          .style('opacity', 0.75)
          .text(format(d.value || 0));
      } else if (!isPrimitiveArrayLeaf(d)) {
        const v = d.data ? d.data.value : undefined;
        const vStr = v === null ? 'null' : typeof v === 'string' ? `"${v}"` : String(v);
        container
          .append('xhtml:div')
          .style('opacity', 0.75)
          .text(vStr);
      }
    });

    el.appendChild(svg.node());
  }, [data, width, height, fontSize]);

  return (
    <div
      ref={containerRef}
      aria-label="Treemap visualization"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
