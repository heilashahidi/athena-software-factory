import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { INITIAL_NODES, INITIAL_EDGES, NODE_DETAILS } from './nodes';

function FactoryNode({ data, selected }) {
  const node = NODE_DETAILS[data.id];
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: node.border, width: 8, height: 8 }} />
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
      <Handle type="source" position={Position.Right} style={{ background: node.border, width: 8, height: 8 }} />
    </>
  );
}

const nodeTypes = { factory: FactoryNode };

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selected, setSelected] = useState(null);

  const onNodeClick = useCallback((_, node) => {
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
          <div style={{ fontSize: 11, color: '#8a897f', marginTop: 6 }}>Click any node to explore</div>
        </div>

        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="#e6e5e1" gap={20} size={1} />
          <Controls />
          <MiniMap nodeColor={n => NODE_DETAILS[n.data?.id]?.color ?? '#eee'} />
        </ReactFlow>
      </div>

      {detail && (
        <div style={{
          width: 340,
          background: '#fff',
          borderLeft: '1px solid #e6e5e1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #e6e5e1' }}>
            <div style={{
              display: 'inline-block',
              background: detail.color,
              border: `1.5px solid ${detail.border}`,
              borderRadius: 6,
              padding: '2px 10px',
              fontSize: 11,
              color: detail.border,
              fontWeight: 600,
              marginBottom: 10,
            }}>{detail.role}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.015em' }}>{detail.label}</div>
          </div>
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {detail.details.map((d, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: detail.border, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#2a2a28', lineHeight: 1.6 }}>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ padding: '12px 24px', borderTop: '1px solid #e6e5e1' }}>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: '1px solid #e6e5e1', borderRadius: 6, padding: '6px 14px', fontSize: 12, color: '#5f5e5a', cursor: 'pointer' }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
