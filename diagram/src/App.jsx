import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { INITIAL_NODES, INITIAL_EDGES, NODE_DETAILS } from './nodes';

function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!chart || !ref.current) return;
    const id = idRef.current;
    window.mermaid?.render(id, chart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {});
  }, [chart]);

  return (
    <div ref={ref} style={{ width: '100%', overflowX: 'auto', marginTop: 8 }} />
  );
}

function FactoryNode({ data, selected }) {
  const node = NODE_DETAILS[data.id];
  return (
    <>
      {['left','right','top','bottom'].map(pos => ['source','target'].map(type => (
        <Handle key={`${pos}-${type}`} type={type} position={Position[pos.charAt(0).toUpperCase()+pos.slice(1)]} id={`${pos}-${type}`} style={{ background: node.border, width: 6, height: 6, opacity: 0 }} />
      )))}
      <div style={{
        background: node.color,
        border: `2px solid ${selected ? '#0F6E56' : node.border}`,
        borderRadius: 10,
        padding: '10px 16px',
        minWidth: 130,
        boxShadow: selected ? `0 0 0 3px #0F6E5640` : '0 1px 4px rgba(0,0,0,0.10)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: node.text, letterSpacing: '-0.01em' }}>{node.label}</div>
        <div style={{ fontSize: 11, color: node.border, marginTop: 2, opacity: 0.85 }}>{node.role}</div>
      </div>
    </>
  );
}

function DiamondNode({ data, selected }) {
  const node = NODE_DETAILS[data.id];
  const size = 110;
  return (
    <>
      {['left','right','top','bottom'].map(pos => ['source','target'].map(type => (
        <Handle key={`${pos}-${type}`} type={type} position={Position[pos.charAt(0).toUpperCase()+pos.slice(1)]} id={`${pos}-${type}`} style={{ background: node.border, width: 6, height: 6, opacity: 0 }} />
      )))}
      <div style={{ width: size, height: size, position: 'relative', cursor: 'pointer' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: node.color,
          border: `2px solid ${selected ? '#0F6E56' : node.border}`,
          transform: 'rotate(45deg)',
          borderRadius: 6,
          boxShadow: selected ? `0 0 0 3px #0F6E5640` : '0 1px 4px rgba(0,0,0,0.10)',
          transition: 'box-shadow 0.15s',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '0 12px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: node.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{node.label}</div>
          <div style={{ fontSize: 10, color: node.border, marginTop: 2, opacity: 0.85, lineHeight: 1.2 }}>{node.role}</div>
        </div>
      </div>
    </>
  );
}

const nodeTypes = { factory: FactoryNode, diamond: DiamondNode };

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const [mermaidReady, setMermaidReady] = useState(false);

  useEffect(() => {
    if (window.mermaid) { setMermaidReady(true); return; }
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
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
    document.head.appendChild(script);
    window.addEventListener('mermaid-ready', () => setMermaidReady(true), { once: true });
  }, []);

  const dragged = useRef(false);

  const onNodeDragStart = useCallback(() => { dragged.current = false; }, []);
  const onNodeDrag = useCallback(() => { dragged.current = true; }, []);
  const onNodeDragStop = useCallback(() => {
    setTimeout(() => { dragged.current = false; }, 100);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    if (dragged.current) return;
    setSelected(prev => prev?.id === node.id ? null : node);
  }, []);

  const onPaneClick = useCallback(() => setSelected(null), []);

  const detail = selected ? NODE_DETAILS[selected.data.id] : null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fbfbfa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>Athena Digital</div>
          <div style={{ fontSize: 13, color: '#5f5e5a', marginTop: 2 }}>Software Factory — Master Architecture</div>
          <div style={{ fontSize: 11, color: '#8a897f', marginTop: 6 }}>Click a node to open its subsystem diagram</div>
        </div>

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
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="#e6e5e1" gap={20} size={1} />
          <Controls position="bottom-right" />
          <MiniMap nodeColor={n => NODE_DETAILS[n.data?.id]?.color ?? '#eee'} position="top-right" />
        </ReactFlow>
      </div>

      {detail && (
        <div style={{
          width: 480,
          background: '#fff',
          borderLeft: '1px solid #e6e5e1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #e6e5e1', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{
                display: 'inline-block', background: detail.color,
                border: `1.5px solid ${detail.border}`, borderRadius: 6,
                padding: '2px 10px', fontSize: 11, color: detail.border,
                fontWeight: 600, marginBottom: 8,
              }}>{detail.role}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.015em' }}>{detail.label}</div>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8a897f', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* Subsystem diagram */}
            {detail.mermaid && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e6e5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a897f' }}>Subsystem diagram</div>
                  <a href={`#/node/${selected?.data?.id}`} style={{ fontSize: 11, color: detail.border, textDecoration: 'none', fontWeight: 600 }}>Open full page →</a>
                </div>
                {mermaidReady
                  ? <MermaidDiagram chart={detail.mermaid} key={detail.label} />
                  : <div style={{ color: '#8a897f', fontSize: 12 }}>Loading diagram…</div>
                }
              </div>
            )}

            {/* Bullet points */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a897f', marginBottom: 14 }}>Key points</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {detail.details.map((d, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: detail.border, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#2a2a28', lineHeight: 1.6 }}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
