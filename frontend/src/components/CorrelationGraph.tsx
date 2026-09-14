/**
 * CorrelationGraph — Canvas-based live network graph.
 *
 * Renders a force-directed graph with:
 *  - Ambient idle state (ghost nodes + subtle drift)
 *  - Dynamic attack chain reveal (nodes/edges fade in progressively)
 *  - Particle traces flowing along active attack edges
 *  - Pulsing threat nodes
 *  - A floating React threat inspector card (NOT on canvas)
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { SimulationState } from '../hooks/useAttackSimulation';
import type { GraphNodeDef } from '../engine/attackEngine';

// ── Types ────────────────────────────────────────────────────────────────────

interface CanvasNode {
  id: string;
  label: string;
  sublabel: string;
  kind: 'peripheral' | 'external_ip' | 'api' | 'user' | 'server' | 'database';
  // Current position
  x: number; y: number;
  // Target position (lerp toward this)
  tx: number; ty: number;
  // Animation
  opacity: number;    // 0 → 1 on appear
  pulse: number;      // 0..2π oscillates
  pulseAmp: number;   // glow intensity
  radius: number;
  // Status
  status: 'peripheral' | 'normal' | 'suspicious' | 'threat';
}

interface Particle {
  t: number;          // 0..1 position along bezier
  speed: number;      // t-units per second
  opacity: number;
}

interface CanvasEdge {
  fromId: string;
  toId: string;
  status: 'quiet' | 'suspicious' | 'attack';
  opacity: number;
  dashOffset: number;
  particles: Particle[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  peripheral:  '#94a3b8',
  external_ip: '#4f46e5',
  api:         '#8b5cf6',
  user:        '#3b82f6',
  server:      '#10b981',
  database:    '#ef4444',
};

const NODE_ABBR: Record<string, string> = {
  peripheral:  '○',
  external_ip: 'IP',
  api:         'API',
  user:        'USR',
  server:      'SRV',
  database:    'DB',
};

// Ghost/ambient peripheral nodes always present in the graph
const PERIPHERAL_DEFS = [
  { id: 'p-firewall',   label: 'Firewall',    sublabel: 'Edge security', kind: 'peripheral' as const },
  { id: 'p-workstation',label: 'Workstation', sublabel: 'Internal host', kind: 'peripheral' as const },
  { id: 'p-cloud',      label: 'Cloud CDN',   sublabel: 'AWS us-east-1', kind: 'peripheral' as const },
  { id: 'p-gateway',    label: 'API Gateway', sublabel: 'Load balancer', kind: 'peripheral' as const },
  { id: 'p-server',     label: 'Auth Server', sublabel: 'Identity svc',  kind: 'peripheral' as const },
];

// Quiet ambient edges between peripheral nodes (show idle activity)
const AMBIENT_EDGE_PAIRS = [
  ['p-firewall', 'p-gateway'],
  ['p-gateway',  'p-server'],
  ['p-server',   'p-workstation'],
  ['p-workstation', 'p-cloud'],
];

// ── Zone positions for each node type (normalized -0.5..0.5 relative to canvas center) ──
function getZoneTarget(kind: string, index: number, w: number, h: number): { tx: number, ty: number } {
  const cx = w / 2, cy = h / 2;
  const jitter = () => (Math.random() - 0.5) * 60;
  switch (kind) {
    case 'external_ip': return { tx: cx - 160 + jitter(), ty: cy - 140 + jitter() };
    case 'api':         return { tx: cx + 40  + index * 30 + jitter(), ty: cy - 100 + jitter() };
    case 'user':        return { tx: cx - 100 + jitter(), ty: cy + 20 + jitter() };
    case 'server':      return { tx: cx + 80  + jitter(), ty: cy + 60 + jitter() };
    case 'database':    return { tx: cx + 160 + jitter(), ty: cy + 130 + jitter() };
    case 'peripheral':  {
      const angles = [0.3, 1.1, 2.0, 2.9, 4.2];
      const angle  = angles[index % angles.length];
      const r      = Math.min(w, h) * 0.38;
      return { tx: cx + Math.cos(angle) * r * (0.8 + Math.random() * 0.4), ty: cy + Math.sin(angle) * r * 0.65 };
    }
    default: return { tx: cx + jitter(), ty: cy + jitter() };
  }
}

// ── Bezier helper ─────────────────────────────────────────────────────────────

function bezierPoint(x1: number, y1: number, x2: number, y2: number, t: number) {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.2;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.2;
  const s  = 1 - t;
  return {
    x: s * s * x1 + 2 * s * t * mx + t * t * x2,
    y: s * s * y1 + 2 * s * t * my + t * t * y2,
  };
}

// ── Component Props ───────────────────────────────────────────────────────────

interface Props {
  simulationState?: SimulationState;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const CorrelationGraph: React.FC<Props> = ({ simulationState }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Animation data in refs — never trigger re-renders
  const nodesRef   = useRef<CanvasNode[]>([]);
  const edgesRef   = useRef<CanvasEdge[]>([]);
  const rafRef     = useRef<number>(0);
  const lastTsRef  = useRef<number>(0);
  const sizeRef    = useRef({ w: 0, h: 0 });
  const timeRef    = useRef(0); // global clock for idle drift

  // Active threat inspector node id (for the floating card)
  const [inspectorNodeId, setInspectorNodeId] = useState<string>('');
  const [inspectorPos, setInspectorPos]       = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // ── Initialize peripheral nodes ──────────────────────────────────────────────
  const initPeripheralNodes = useCallback((w: number, h: number) => {
    const nodes: CanvasNode[] = PERIPHERAL_DEFS.map((def, i) => {
      const { tx, ty } = getZoneTarget('peripheral', i, w, h);
      return {
        id: def.id, label: def.label, sublabel: def.sublabel, kind: 'peripheral',
        x: tx + (Math.random() - 0.5) * 100, y: ty + (Math.random() - 0.5) * 100,
        tx, ty, opacity: 0, pulse: Math.random() * Math.PI * 2,
        pulseAmp: 0, radius: 14, status: 'peripheral',
      };
    });
    nodesRef.current = nodes;

    const edges: CanvasEdge[] = AMBIENT_EDGE_PAIRS.map(([a, b]) => ({
      fromId: a, toId: b, status: 'quiet', opacity: 0, dashOffset: 0, particles: [],
    }));
    edgesRef.current = edges;
  }, []);

  // ── React to simulationState changes ────────────────────────────────────────
  useEffect(() => {
    if (!simulationState) return;
    const { phase, chainNodes, revealedEdgeCount, activeNodeIds, threatNodeId } = simulationState;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;

    if (phase === 'idle') {
      // Remove all chain nodes, revert edges
      nodesRef.current = nodesRef.current.filter(n => n.kind === 'peripheral');
      edgesRef.current = edgesRef.current.filter(e =>
        AMBIENT_EDGE_PAIRS.some(([a, b]) => e.fromId === a && e.toId === b)
      );
      edgesRef.current.forEach(e => { e.status = 'quiet'; e.particles = []; });
      return;
    }

    // ── Upsert chain nodes ──
    const apiCount: Record<string, number> = {};
    chainNodes.forEach((def, i) => {
      const existing = nodesRef.current.find(n => n.id === def.id);
      const idx = apiCount[def.type] ?? 0;
      apiCount[def.type] = idx + 1;

      const status: CanvasNode['status'] = def.id === threatNodeId ? 'threat'
        : activeNodeIds.has(def.id) ? 'suspicious'
        : i <= revealedEdgeCount ? 'normal'
        : 'peripheral';

      if (existing) {
        existing.status   = status;
        existing.pulseAmp = status === 'threat' ? 1.0 : status === 'suspicious' ? 0.5 : 0;
      } else {
        const { tx, ty } = getZoneTarget(def.type, idx, w, h);
        const node: CanvasNode = {
          id: def.id, label: def.label, sublabel: def.sublabel,
          kind: def.type as CanvasNode['kind'],
          x: w / 2, y: h / 2,  // start from center, fly to target
          tx, ty,
          opacity: 0,
          pulse: Math.random() * Math.PI * 2,
          pulseAmp: status === 'threat' ? 1.0 : status === 'suspicious' ? 0.5 : 0,
          radius: def.type === 'external_ip' || def.type === 'database' ? 24 : 20,
          status,
        };
        nodesRef.current.push(node);
      }
    });

    // ── Upsert chain edges ──
    const visibleChain = chainNodes.slice(0, revealedEdgeCount + 1);
    for (let i = 0; i < visibleChain.length - 1; i++) {
      const fromId = visibleChain[i].id;
      const toId   = visibleChain[i + 1].id;
      let edge = edgesRef.current.find(e => e.fromId === fromId && e.toId === toId);

      const edgeStatus: CanvasEdge['status'] =
        phase === 'resolved' || phase === 'escalating' ? 'attack' : 'suspicious';

      if (edge) {
        edge.status = edgeStatus;
        if (edge.particles.length === 0 && edgeStatus === 'attack') {
          edge.particles = Array.from({ length: 4 }, (_, k) => ({
            t: k / 4, speed: 0.18 + Math.random() * 0.08, opacity: 0.85,
          }));
        }
      } else {
        const newEdge: CanvasEdge = {
          fromId, toId, status: edgeStatus, opacity: 0, dashOffset: 0,
          particles: edgeStatus === 'attack' ? Array.from({ length: 4 }, (_, k) => ({
            t: k / 4, speed: 0.18 + Math.random() * 0.08, opacity: 0.85,
          })) : [],
        };
        edgesRef.current.push(newEdge);
      }
    }

    // Update inspector
    if (threatNodeId) {
      setInspectorNodeId(threatNodeId);
    }

  }, [simulationState]);

  // ── Canvas draw loop ─────────────────────────────────────────────────────────
  const drawLoop = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    if (!ctx) return;

    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05); // cap at 50ms
    lastTsRef.current = ts;
    timeRef.current  += dt;
    const t = timeRef.current;

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // ── 1. Draw circular grid ──
    ctx.save();
    const cx = w / 2, cy = h / 2;
    for (let r = 40; r < Math.max(w, h); r += 80) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.6, r * 0.9, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(148,163,184,${0.05 + (r % 160 === 0 ? 0.03 : 0)})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
    ctx.restore();

    // ── 2. Lerp nodes toward targets + idle drift ──
    nodes.forEach(node => {
      const lerpSpeed = 2.5;
      node.x += (node.tx - node.x) * lerpSpeed * dt;
      node.y += (node.ty - node.y) * lerpSpeed * dt;

      // Idle drift for peripheral / non-active nodes
      if (node.status === 'peripheral' || node.status === 'normal') {
        node.x += Math.sin(t * 0.4 + node.pulse) * 0.3;
        node.y += Math.cos(t * 0.3 + node.pulse * 1.3) * 0.2;
      }

      // Fade in
      node.opacity = Math.min(node.opacity + dt * (node.status === 'peripheral' ? 0.6 : 1.5), 1);

      // Pulse oscillation
      node.pulse += dt * (node.status === 'threat' ? 2.2 : node.status === 'suspicious' ? 1.4 : 0.5);
    });

    // ── 3. Build node position map ──
    const posMap = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]));

    // ── 4. Draw edges ──
    edges.forEach(edge => {
      const from = posMap.get(edge.fromId);
      const to   = posMap.get(edge.toId);
      if (!from || !to) return;

      edge.opacity = Math.min(edge.opacity + dt * 1.0, 1);
      edge.dashOffset -= dt * (edge.status === 'attack' ? 60 : edge.status === 'suspicious' ? 35 : 0);

      const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.2;
      const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.2;

      ctx.save();
      ctx.globalAlpha = edge.opacity * (edge.status === 'quiet' ? 0.2 : edge.status === 'suspicious' ? 0.55 : 0.85);

      if (edge.status === 'attack') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth   = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = edge.dashOffset;
        ctx.shadowColor = 'rgba(239,68,68,0.5)';
        ctx.shadowBlur  = 8;
      } else if (edge.status === 'suspicious') {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = edge.dashOffset;
        ctx.shadowColor = 'rgba(139,92,246,0.3)';
        ctx.shadowBlur  = 5;
      } else {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth   = 1;
        ctx.setLineDash([2, 4]);
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(mx, my, to.x, to.y);
      ctx.stroke();
      ctx.restore();

      // ── 5. Draw arrowhead for attack edges ──
      if (edge.status === 'attack') {
        const pt  = bezierPoint(from.x, from.y, to.x, to.y, 0.92);
        const pt2 = bezierPoint(from.x, from.y, to.x, to.y, 0.98);
        const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x);
        ctx.save();
        ctx.translate(pt2.x, pt2.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fillStyle   = '#ef4444';
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.restore();
      }

      // ── 6. Animate particles ──
      edge.particles.forEach(p => {
        p.t = (p.t + p.speed * dt) % 1;
        const pt = bezierPoint(from.x, from.y, to.x, to.y, p.t);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        const baseColor = edge.status === 'attack' ? '239,68,68' : '139,92,246';
        ctx.fillStyle   = `rgba(${baseColor},${p.opacity * edge.opacity})`;
        ctx.shadowColor = `rgba(${baseColor},0.7)`;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.restore();
      });
    });

    // ── 7. Draw nodes ──
    nodes.forEach(node => {
      if (node.opacity < 0.01) return;
      const { x, y, radius, kind, status, pulse, pulseAmp, opacity } = node;
      const color = NODE_COLORS[kind] ?? '#94a3b8';
      const isPeripheral = status === 'peripheral';

      ctx.save();
      ctx.globalAlpha = opacity * (isPeripheral ? 0.35 : 1);

      // Glow ring for threat/suspicious
      if (pulseAmp > 0) {
        const pulseScale = 1 + Math.sin(pulse) * 0.35 * pulseAmp;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8 * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.globalAlpha = opacity * pulseAmp * 0.15 * (0.5 + 0.5 * Math.sin(pulse));
        ctx.shadowColor = color;
        ctx.shadowBlur  = 20;
        ctx.fill();
        ctx.globalAlpha = opacity * (isPeripheral ? 0.35 : 1);
        ctx.shadowBlur  = 0;
      }

      // Node body
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      if (isPeripheral) {
        ctx.fillStyle   = 'rgba(255,255,255,0.7)';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth   = 1;
      } else if (status === 'threat') {
        ctx.fillStyle   = '#ef4444';
        ctx.shadowColor = 'rgba(239,68,68,0.6)';
        ctx.shadowBlur  = 20 + Math.sin(pulse) * 12;
      } else if (status === 'suspicious') {
        ctx.fillStyle   = color;
        ctx.shadowColor = `${color}88`;
        ctx.shadowBlur  = 10 + Math.sin(pulse) * 5;
      } else {
        ctx.fillStyle   = color;
        ctx.shadowColor = `${color}44`;
        ctx.shadowBlur  = 6;
      }

      ctx.fill();

      if (!isPeripheral) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth   = 2;
        ctx.stroke();
      } else {
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // ── Abbreviation text inside node ──
      if (!isPeripheral) {
        ctx.fillStyle  = 'white';
        ctx.font       = `600 ${kind === 'api' ? 8 : 10}px "JetBrains Mono", monospace`;
        ctx.textAlign  = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(NODE_ABBR[kind] ?? '?', x, y);
      } else {
        // Tiny dot for peripheral
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
      }

      // ── Label below node ──
      const labelOpacity = isPeripheral ? 0.4 : 1;
      ctx.globalAlpha = opacity * labelOpacity;
      ctx.fillStyle   = isPeripheral ? '#94a3b8' : '#334155';
      ctx.font        = `500 ${isPeripheral ? 9 : 10}px "JetBrains Mono", monospace`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, x, y + radius + 6);

      if (!isPeripheral && node.sublabel) {
        ctx.fillStyle = '#94a3b8';
        ctx.font      = '400 9px "JetBrains Mono", monospace';
        ctx.fillText(node.sublabel, x, y + radius + 18);
      }

      ctx.restore();
    });

    rafRef.current = requestAnimationFrame(drawLoop);
  }, []);

  // ── Resize observer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      canvas.width  = width  * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
      sizeRef.current = { w: width, h: height };
      initPeripheralNodes(width, height);
    });

    ro.observe(wrapper);

    rafRef.current = requestAnimationFrame(drawLoop);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [drawLoop, initPeripheralNodes]);

  // Fade in peripheral nodes after a short delay
  useEffect(() => {
    const t = setTimeout(() => {
      nodesRef.current.forEach(n => { if (n.kind === 'peripheral') n.opacity = 0; });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  // ── Inspector card position (from canvas node position) ──
  useEffect(() => {
    if (!inspectorNodeId) return;
    const node = nodesRef.current.find(n => n.id === inspectorNodeId);
    if (node) {
      setInspectorPos({ x: node.x, y: node.y });
    }
  });

  const sim = simulationState;
  const phase = sim?.phase ?? 'idle';
  const isActive = phase !== 'idle';

  return (
    <div className="relative w-full" style={{ minHeight: 520 }}>
      {/* ── View Filter tabs ── */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 py-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Views:</span>
          {['All Correlated Entities', 'Active Attack Vector', 'Identity & Credential Path'].map((v, i) => (
            <button
              key={v}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                i === 0
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 hover:text-slate-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Threat</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Suspicious</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />Ambient</span>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={wrapperRef} className="relative w-full" style={{ height: 460 }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: 'default' }}
        />

        {/* ── Floating Threat Inspector Card (React, not canvas) ── */}
        {sim?.threatInfo && (phase === 'escalating' || phase === 'resolved') && (
          <div
            className="absolute top-5 right-5 w-72 bg-white/96 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-30 overflow-hidden"
            style={{ animation: 'fadeSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border
                ${sim.threatInfo.badgeColor === 'rose'   ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  sim.threatInfo.badgeColor === 'amber'  ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  sim.threatInfo.badgeColor === 'violet' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                  'bg-indigo-50 text-indigo-600 border-indigo-200'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                {sim.threatInfo.badge}
              </span>
              <button className="text-slate-400 hover:text-slate-600 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[9px] text-white font-bold">!</div>
                <h2 className="font-bold text-[13px] text-slate-900">{sim.threatInfo.title}</h2>
              </div>
              <p className="font-mono text-[10px] text-slate-500 pl-7">{sim.threatInfo.subtitle}</p>
            </div>

            <div className="px-4 pb-3 space-y-2 border-t border-slate-100 pt-3">
              {[
                { label: 'Confidence',     value: `${sim.threatInfo.confidence}%`,       cls: 'font-bold text-rose-600 font-mono' },
                { label: 'Related events', value: String(sim.threatInfo.relatedEvents),  cls: 'font-semibold text-slate-700 font-mono' },
                { label: 'Attack chain',   value: sim.threatInfo.chain,                  cls: 'text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-mono' },
                { label: 'First seen',     value: sim.threatInfo.firstSeen,              cls: 'text-slate-600 font-mono text-[11px]' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">{label}</span>
                  <span className={cls}>{value}</span>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-2">
              <button className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition">
                Investigate
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step indicators ── */}
        <div className="absolute right-0 bottom-4 flex flex-col gap-3 text-[9px] font-mono font-semibold tracking-widest select-none">
          {[['01', 'DETECT'], ['02', 'CORRELATE'], ['03', 'PREVENT']].map(([n, label], i) => {
            const active =
              (i === 0 && (phase === 'detecting' || phase === 'correlating' || phase === 'escalating' || phase === 'resolved')) ||
              (i === 1 && (phase === 'correlating' || phase === 'escalating' || phase === 'resolved')) ||
              (i === 2 && phase === 'resolved');
            return (
              <span key={n} className={`cursor-default transition-colors text-right ${active ? 'text-indigo-500' : 'text-slate-300'}`}>
                {n}<br/>{label}
              </span>
            );
          })}
        </div>

        {/* ── Idle ambient label ── */}
        {!isActive && (
          <div className="absolute bottom-8 left-48 pointer-events-none z-10">
            <p className="font-serif italic text-[13px] text-slate-400 leading-tight">
              A clearer view<br />of a safer world.
            </p>
            <div className="w-5 h-px bg-slate-300 mt-1.5" />
          </div>
        )}

        {/* ── Attack phase status pill ── */}
        {isActive && phase !== 'resolved' && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-600 uppercase tracking-widest">
              {phase === 'detecting' ? 'Detecting…' : phase === 'correlating' ? 'Correlating…' : 'Escalating…'}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CorrelationGraph;
