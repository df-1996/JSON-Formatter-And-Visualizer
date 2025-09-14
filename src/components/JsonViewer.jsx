import { useEffect, useState } from 'react';

export default function JsonViewer({ data, apiRef, showExpandCollapse = true, showSearch = true, searchQuery, onMatchCount }) {
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const keyOf = (path) => path.join('.');
  const effectiveSearch = searchQuery !== undefined ? searchQuery : search;

  // No persistence; keep state in-memory only.

  const toggle = (path) => {
    const k = keyOf(path);
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const collectAllContainers = (value, path = ['root'], acc = []) => {
    if (value && typeof value === 'object') {
      acc.push(keyOf(path));
      if (Array.isArray(value)) {
        value.forEach((v, i) => collectAllContainers(v, [...path, String(i)], acc));
      } else {
        Object.keys(value).forEach((k) => collectAllContainers(value[k], [...path, k], acc));
      }
    }
    return acc;
  };

  const collapseAll = () => {
    setCollapsed(new Set(collectAllContainers(data)));
  };
  const expandAll = () => setCollapsed(new Set());

  const matchStr = (v) => {
    if (!effectiveSearch) return false;
    try {
      const s = String(v);
      return s.toLowerCase().includes(effectiveSearch.toLowerCase());
    } catch {
      return false;
    }
  };

  // Compute which container paths should be force-expanded due to a match
  const computeMatches = () => {
    if (!effectiveSearch) return { forceExpand: new Set(), matchCount: 0 };
    const set = new Set();
    let count = 0;
    const walk = (value, path = ['root']) => {
      let has = false;
      if (value && typeof value === 'object') {
        const entries = Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value);
        for (const [k, v] of entries) {
          const childPath = [...path, String(k)];
          const childHas = walk(v, childPath);
          const keyMatch = !Array.isArray(value) && matchStr(k);
          if (keyMatch) count += 1;
          if (childHas || keyMatch) has = true;
        }
      } else {
        if (matchStr(value)) {
          has = true;
          count += 1;
        }
      }
      if (has) set.add(keyOf(path));
      return has;
    };
    walk(data);
    return { forceExpand: set, matchCount: count };
  };
  const { forceExpand, matchCount } = computeMatches();

  useEffect(() => {
    if (onMatchCount) onMatchCount(matchCount || 0);
  }, [onMatchCount, matchCount]);

  // Expose simple API to parent for toolbar actions
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      expandAll,
      collapseAll,
    };
  }, [apiRef, expandAll, collapseAll]);

  const Node = ({ name, value, path, level, isLast }) => {
    const indent = level * 14;
    const isObj = value && typeof value === 'object' && !Array.isArray(value);
    const isArr = Array.isArray(value);
    const isContainer = isObj || isArr;
    const k = keyOf(path);
    const isCollapsed = collapsed.has(k) && !forceExpand.has(k);

    const keyStyle = { color: '#9cdcfe' };
    const punctStyle = { color: '#93a1a1' };
    const valStyle = (v) => {
      const t = v === null ? 'null' : typeof v;
      switch (t) {
        case 'string':
          return { color: '#ce9178' };
        case 'number':
          return { color: '#b5cea8' };
        case 'boolean':
          return { color: '#569cd6' };
        case 'null':
          return { color: '#dcdcaa' };
        default:
          return { color: '#d6deeb' };
      }
    };

    if (!isContainer) {
      const renderValue = () => {
        if (value === null) return 'null';
        if (typeof value === 'string') return `"${value}"`;
        return String(value);
      };
      const matched = effectiveSearch && (matchStr(name) || matchStr(value));
      return (
        <div style={{ paddingLeft: indent, background: matched ? 'rgba(255,255,0,0.08)' : 'transparent' }}>
          {name !== undefined && (
            <>
              <span style={keyStyle}>{JSON.stringify(String(name))}</span>
              <span style={punctStyle}>: </span>
            </>
          )}
          <span style={valStyle(value)}>{renderValue()}</span>
          {!isLast && <span style={punctStyle}>,</span>}
        </div>
      );
    }

    const childEntries = isArr ? value.map((v, i) => [i, v]) : Object.entries(value);
    const matched = effectiveSearch && matchStr(name);
    return (
      <div>
        <div style={{ paddingLeft: indent, display: 'flex', alignItems: 'center', gap: 6, background: matched ? 'rgba(255,255,0,0.08)' : 'transparent' }}>
          <button
            type="button"
            onClick={() => toggle(path)}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            style={{
              width: 16,
              height: 16,
              border: '1px solid #3b4252',
              borderRadius: 3,
              background: '#1f2430',
              color: '#d6deeb',
              lineHeight: '14px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 10,
              padding: 0,
            }}
          >
            {isCollapsed ? '+' : '−'}
          </button>
          {name !== undefined && (
            <>
              <span style={keyStyle}>{JSON.stringify(String(name))}</span>
              <span style={punctStyle}>: </span>
            </>
          )}
          <span style={punctStyle}>{isObj ? '{' : '['}</span>
          <span style={{ color: '#7f8c8d', marginLeft: 6 }}>
            {isObj ? `${childEntries.length} key${childEntries.length === 1 ? '' : 's'}` : `${childEntries.length} item${childEntries.length === 1 ? '' : 's'}`}
          </span>
          <span style={punctStyle}>{isCollapsed ? (isObj ? '}' : ']') : ''}</span>
          {!isCollapsed && <span style={punctStyle}>{/* opening brace already printed */}</span>}
          {isCollapsed && !isLast && <span style={punctStyle}>,</span>}
        </div>
        {!isCollapsed && (
          <div>
            {childEntries.map(([kChild, vChild], idx) => (
              <Node
                key={String(kChild)}
                name={isArr ? undefined : kChild}
                value={vChild}
                path={[...path, String(kChild)]}
                level={level + 1}
                isLast={idx === childEntries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span style={punctStyle}>{isObj ? '}' : ']'}</span>
              {!isLast && <span style={punctStyle}>,</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
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
      {(showExpandCollapse || showSearch) && (
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {showExpandCollapse && (
            <>
              <button
                type="button"
                onClick={expandAll}
                style={{ padding: '2px 8px', border: '1px solid #223', background: '#16213e', color: '#d6deeb', borderRadius: 4, cursor: 'pointer' }}
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                style={{ padding: '2px 8px', border: '1px solid #223', background: '#16213e', color: '#d6deeb', borderRadius: 4, cursor: 'pointer' }}
              >
                Collapse all
              </button>
            </>
          )}
          {showSearch && (
            <>
              <input
                type="search"
                placeholder="Search keys/values"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #223',
                  background: '#0f172a',
                  color: '#d6deeb',
                  borderRadius: 4,
                  minWidth: 180,
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ padding: '2px 8px', border: '1px solid #223', background: '#16213e', color: '#d6deeb', borderRadius: 4, cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      )}
      <Node name={undefined} value={data} path={['root']} level={0} isLast={true} />
    </div>
  );
}
