import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, Handle, Position,
  ConnectionMode, BaseEdge, getBezierPath, EdgeLabelRenderer,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { INITIAL_NODES, INITIAL_EDGES, NODE_DETAILS } from './nodes';

const PANEL_W = 430;
const POS_KEY = 'athena-node-positions';

function loadPositions() {
  try { return JSON.parse(localStorage.getItem(POS_KEY)) ?? {}; }
  catch { return {}; }
}

function initNodes() {
  const saved = loadPositions();
  return INITIAL_NODES.map(n => saved[n.id] ? { ...n, position: saved[n.id] } : n);
}

const PROCESSED_EDGES = INITIAL_EDGES.map(e =>
  e.style?.strokeDasharray ? { ...e, type: 'dashedAnimated' } : e
);

// ─── Mermaid ──────────────────────────────────────────────────────────────────
function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);
  useEffect(() => {
    if (!chart || !ref.current) return;
    window.mermaid?.render(idRef.current, chart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {});
  }, [chart]);
  return <div ref={ref} style={{ width: '100%', overflowX: 'auto', marginTop: 8 }} />;
}

// ─── Animated dashed edge ─────────────────────────────────────────────────────
function DashedEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label, labelStyle, labelBgStyle }) {
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={{ ...style, animation: 'dashFlow 1.5s linear infinite' }} />
      {label && (
        <EdgeLabelRenderer>
          <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)`, pointerEvents: 'none', ...(labelBgStyle ?? {}), padding: '1px 5px', borderRadius: 3 }}>
            <span style={labelStyle ?? {}}>{label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = { dashedAnimated: DashedEdge };

// ─── Node types ───────────────────────────────────────────────────────────────
function FactoryNode({ data, selected }) {
  const node = NODE_DETAILS[data.id];
  const [hov, setHov] = useState(false);
  return (
    <>
      {['left', 'right', 'top', 'bottom'].flatMap(pos =>
        ['source', 'target'].map(type => (
          <Handle
            key={`${pos}-${type}`}
            type={type}
            position={Position[pos.charAt(0).toUpperCase() + pos.slice(1)]}
            id={`${pos}-${type}`}
            style={{ background: node.border, width: 6, height: 6, opacity: 0 }}
          />
        ))
      )}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: node.color,
          border: `2px solid ${selected ? '#0F6E56' : node.border}`,
          borderRadius: 10,
          padding: '10px 14px',
          minWidth: 130,
          cursor: 'pointer',
          transition: 'box-shadow 0.18s, transform 0.18s',
          boxShadow: hov
            ? `0 6px 20px rgba(0,0,0,0.13), 0 0 0 1px ${node.border}33`
            : selected
              ? `0 0 0 3px #0F6E5640`
              : '0 1px 4px rgba(0,0,0,0.10)',
          transform: hov ? 'translateY(-2px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          {node.icon && <span style={{ fontSize: 13, color: node.border, lineHeight: 1 }}>{node.icon}</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: node.text, letterSpacing: '-0.01em' }}>{node.label}</span>
        </div>
        <div style={{ fontSize: 11, color: node.border, opacity: 0.85 }}>{node.role}</div>
      </div>
    </>
  );
}

function DiamondNode({ data, selected }) {
  const node = NODE_DETAILS[data.id];
  const [hov, setHov] = useState(false);
  const size = 110;
  return (
    <>
      {['left', 'right', 'top', 'bottom'].flatMap(pos =>
        ['source', 'target'].map(type => (
          <Handle
            key={`${pos}-${type}`}
            type={type}
            position={Position[pos.charAt(0).toUpperCase() + pos.slice(1)]}
            id={`${pos}-${type}`}
            style={{ background: node.border, width: 6, height: 6, opacity: 0 }}
          />
        ))
      )}
      <div
        style={{ width: size, height: size, position: 'relative', cursor: 'pointer' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: node.color,
          border: `2px solid ${selected ? '#0F6E56' : node.border}`,
          transform: 'rotate(45deg)',
          borderRadius: 6,
          transition: 'box-shadow 0.18s',
          boxShadow: hov
            ? `0 6px 20px rgba(0,0,0,0.13)`
            : selected
              ? `0 0 0 3px #0F6E5640`
              : '0 1px 4px rgba(0,0,0,0.10)',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 12px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: node.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{node.label}</div>
          <div style={{ fontSize: 10, color: node.border, marginTop: 2, opacity: 0.85, lineHeight: 1.2 }}>{node.role}</div>
        </div>
      </div>
    </>
  );
}

const nodeTypes = { factory: FactoryNode, diamond: DiamondNode };

// ─── Floating panel ───────────────────────────────────────────────────────────
function FloatingPanel({ selected, detail, mermaidReady, onClose }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onHeaderMouseDown = (e) => {
    e.preventDefault();
    const sx = e.clientX - offset.x;
    const sy = e.clientY - offset.y;
    const onMove = (ev) => setOffset({ x: ev.clientX - sx, y: ev.clientY - sy });
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div style={{
      position: 'fixed',
      left: selected.initX + offset.x,
      top: selected.initY + offset.y,
      width: PANEL_W,
      maxHeight: 'calc(100vh - 32px)',
      background: '#fff',
      border: '1px solid #e0dfd9',
      borderRadius: 14,
      boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.07)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
    }}>
      {/* Header / drag handle */}
      <div
        onMouseDown={onHeaderMouseDown}
        style={{
          padding: '14px 18px 12px',
          borderBottom: '1px solid #e6e5e1',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'grab',
          userSelect: 'none',
          background: detail.color,
        }}
      >
        <div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.72)',
            border: `1.5px solid ${detail.border}`,
            borderRadius: 5,
            padding: '2px 8px',
            fontSize: 10,
            color: detail.border,
            fontWeight: 600,
            marginBottom: 7,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{detail.role}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: detail.text ?? '#1a1a18', letterSpacing: '-0.015em', display: 'flex', alignItems: 'center', gap: 8 }}>
            {detail.icon && <span style={{ fontSize: 16 }}>{detail.icon}</span>}
            {detail.label}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: detail.text ?? '#8a897f', padding: 0, lineHeight: 1, flexShrink: 0, marginTop: 4, opacity: 0.55 }}
        >×</button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {detail.mermaid && (
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #e6e5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a897f' }}>Subsystem diagram</div>
              <a href={`#/node/${selected.id}`} style={{ fontSize: 11, color: detail.border, textDecoration: 'none', fontWeight: 600 }}>Full page →</a>
            </div>
            {mermaidReady
              ? <MermaidDiagram chart={detail.mermaid} key={detail.label} />
              : <div style={{ color: '#8a897f', fontSize: 12 }}>Loading…</div>}
          </div>
        )}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a897f', marginBottom: 12 }}>Key points</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {detail.details.map((d, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: detail.border, marginTop: 7, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#2a2a28', lineHeight: 1.6 }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Canvas (inner — needs ReactFlowProvider above it) ────────────────────────
function DiagramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(PROCESSED_EDGES);
  const [selected, setSelected] = useState(null);
  const [mermaidReady, setMermaidReady] = useState(false);
  const dragged = useRef(false);
  const { flowToScreenPosition, getNode } = useReactFlow();

  useEffect(() => {
    if (window.mermaid) { setMermaidReady(true); return; }
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = `
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'loose',
        themeVariables: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '12px', background: '#fff',
          primaryColor: '#E1F5EE', primaryBorderColor: '#0F6E56', primaryTextColor: '#04342C',
          secondaryColor: '#EEEDFE', secondaryBorderColor: '#534AB7', secondaryTextColor: '#26215C',
          tertiaryColor: '#F1EFE8', tertiaryBorderColor: '#5F5E5A', tertiaryTextColor: '#2C2C2A',
          lineColor: '#8a897f', edgeLabelBackground: '#fff',
        }
      });
      window.mermaid = mermaid;
      window.dispatchEvent(new Event('mermaid-ready'));
    `;
    document.head.appendChild(s);
    window.addEventListener('mermaid-ready', () => setMermaidReady(true), { once: true });
  }, []);

  const onNodeDragStart = useCallback(() => { dragged.current = true; }, []);
  const onNodeDrag = useCallback(() => { dragged.current = true; }, []);
  const onNodeDragStop = useCallback((_, node) => {
    const saved = loadPositions();
    saved[node.id] = node.position;
    localStorage.setItem(POS_KEY, JSON.stringify(saved));
    setTimeout(() => { dragged.current = false; }, 100);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    if (dragged.current) return;
    if (selected?.id === node.id) { setSelected(null); return; }
    const rfNode = getNode(node.id);
    const w = rfNode?.measured?.width ?? 150;
    const h = rfNode?.measured?.height ?? 60;
    const rightEdge = flowToScreenPosition({ x: node.position.x + w, y: node.position.y + h / 2 });
    const fitsRight = rightEdge.x + PANEL_W + 24 < window.innerWidth;
    const initX = fitsRight ? rightEdge.x + 16 : rightEdge.x - w - PANEL_W - 16;
    const initY = Math.max(16, Math.min(rightEdge.y - 80, window.innerHeight - 400));
    setSelected({ ...node, initX, initY });
  }, [selected?.id, flowToScreenPosition, getNode]);

  const onPaneClick = useCallback(() => setSelected(null), []);

  const resetLayout = useCallback(() => {
    localStorage.removeItem(POS_KEY);
    setNodes(INITIAL_NODES.map(n => ({ ...n })));
    setSelected(null);
  }, [setNodes]);

  const detail = selected ? NODE_DETAILS[selected.data.id] : null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fbfbfa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Title */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>Athena Digital</div>
        <div style={{ fontSize: 13, color: '#5f5e5a', marginTop: 2 }}>Software Factory — Master Architecture</div>
        <div style={{ fontSize: 11, color: '#8a897f', marginTop: 6 }}>Click a node · drag to rearrange · scroll to zoom</div>
      </div>

      {/* Reset button */}
      <button
        onClick={resetLayout}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 10,
          background: '#fff', border: '1px solid #e6e5e1', borderRadius: 7,
          padding: '6px 14px', fontSize: 12, color: '#5f5e5a', cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >Reset layout</button>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: 12, flexWrap: 'wrap', background: 'rgba(251,251,250,0.92)', padding: '8px 14px', borderRadius: 8, border: '1px solid #e6e5e1', backdropFilter: 'blur(4px)' }}>
        {[
          { color: '#E1F5EE', border: '#0F6E56', label: 'Spine' },
          { color: '#EEEDFE', border: '#534AB7', label: 'Supporting systems' },
          { color: '#FAEEDA', border: '#854F0B', label: 'Gate' },
          { color: '#F1EFE8', border: '#5F5E5A', label: 'I/O' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, background: l.color, border: `2px solid ${l.border}`, borderRadius: 3 }} />
            <span style={{ fontSize: 11, color: '#5f5e5a' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 0, borderTop: '2px solid #0F6E56' }} />
          <span style={{ fontSize: 11, color: '#5f5e5a' }}>Flow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 0, borderTop: '2px dashed #534AB7' }} />
          <span style={{ fontSize: 11, color: '#5f5e5a' }}>Continuous</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color="#e6e5e1" gap={20} size={1} />
        <Controls position="bottom-right" />
        <MiniMap nodeColor={n => NODE_DETAILS[n.data?.id]?.color ?? '#eee'} position="top-right" />
      </ReactFlow>

      {selected && detail && (
        <FloatingPanel
          key={selected.id}
          selected={selected}
          detail={detail}
          mermaidReady={mermaidReady}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─── Export (wraps canvas in ReactFlowProvider so useReactFlow works) ─────────
export default function App() {
  return (
    <ReactFlowProvider>
      <DiagramCanvas />
    </ReactFlowProvider>
  );
}
