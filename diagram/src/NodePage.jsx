import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NODE_DETAILS } from './nodes';

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

function useMermaid() {
  const [ready, setReady] = useState(!!window.mermaid);
  useEffect(() => {
    if (window.mermaid) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = `
      import mermaid from '${MERMAID_CDN}';
      mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'loose',
        themeVariables: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: '13px', background: '#fff',
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
    window.addEventListener('mermaid-ready', () => setReady(true), { once: true });
  }, []);
  return ready;
}

function MermaidFull({ chart, nodeId }) {
  const ref = useRef(null);
  const mermaidReady = useMermaid();
  const id = `mermaid-full-${nodeId}`;

  useEffect(() => {
    if (!mermaidReady || !chart || !ref.current) return;
    window.mermaid.render(id, chart).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(() => {});
  }, [mermaidReady, chart, id]);

  return (
    <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {!mermaidReady && <div style={{ color: '#8a897f', fontSize: 13 }}>Loading diagram…</div>}
    </div>
  );
}

export default function NodePage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const node = NODE_DETAILS[nodeId];

  if (!node) return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={() => navigate('/')} style={backBtn}>← Back</button>
      <p>Node not found.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e6e5e1', background: '#fff', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 20, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={backBtn}>← Master architecture</button>
        <div style={{ width: 1, height: 20, background: '#e6e5e1' }} />
        <div style={{ display: 'inline-block', background: node.color, border: `1.5px solid ${node.border}`, borderRadius: 6, padding: '2px 10px', fontSize: 11, color: node.border, fontWeight: 600 }}>{node.role}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.015em' }}>{node.label}</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 40px 80px' }}>
        {/* Diagram */}
        {node.mermaid && (
          <div style={{ background: '#fff', border: '1px solid #e6e5e1', borderRadius: 12, padding: '32px 24px', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 650, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a897f', marginBottom: 20 }}>Subsystem diagram</div>
            <MermaidFull chart={node.mermaid} nodeId={nodeId} />
          </div>
        )}

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {node.details.map((d, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e6e5e1', borderRadius: 10, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: node.border, marginTop: 5, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#2a2a28', lineHeight: 1.65 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const backBtn = {
  background: 'none',
  border: '1px solid #e6e5e1',
  borderRadius: 6,
  padding: '6px 14px',
  fontSize: 12,
  color: '#5f5e5a',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
