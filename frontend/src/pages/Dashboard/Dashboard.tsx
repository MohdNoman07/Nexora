import React, { useState, useEffect } from 'react';
import { CorrelationGraph } from '../../components/CorrelationGraph';
import { useAttackSimulation } from '../../hooks/useAttackSimulation';
import type { AttackEvent } from '../../engine/attackEngine';
import MountainImg from '../../assets/Mountain.png';
import SideGlobeImg from '../../assets/side_globe_dashboard.png';

// ── Base stats (before any simulation deltas) ────────────────────────────────
const BASE_STATS = { events: 1_240_000, anomalies: 14, threats: 3 };

function formatEvents(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString();
}

// ── Seed events for initial live stream ─────────────────────────────────────
const SEED_EVENTS: AttackEvent[] = [
  { id: 's1', time: '22:41:16', severity: 'critical', label: 'Threat Identified',   method: 'POST', path: '/api/users/search', ip: '185.42.91.8',  detail: 'SQL Injection pattern matched',     delayMs: 0 },
  { id: 's2', time: '22:41:14', severity: 'info',     label: 'Correlation Created', method: '—',    path: 'Attack chain AC-014', ip: '—',           detail: '4 related events linked',           delayMs: 0 },
  { id: 's3', time: '22:41:12', severity: 'high',     label: 'Anomaly Detected',    method: 'GET',  path: '/api/users',          ip: '192.168.1.45', detail: 'Unusual parameter detected',        delayMs: 0 },
  { id: 's4', time: '22:41:10', severity: 'medium',   label: 'Suspicious Request',  method: 'POST', path: '/api/login',          ip: '185.42.91.8',  detail: '401 - Failed login attempt',        delayMs: 0 },
  { id: 's5', time: '22:41:08', severity: 'info',     label: 'Normal Event',        method: 'GET',  path: '/',                   ip: '192.168.1.10', detail: '200 - OK',                          delayMs: 0 },
];

// ── Event row color config ───────────────────────────────────────────────────
const SEV_CONFIG = {
  critical: { typeColor: 'text-rose-600',   dot: 'bg-rose-500',   detailColor: 'text-rose-600 font-semibold' },
  high:     { typeColor: 'text-amber-600',  dot: 'bg-amber-400',  detailColor: 'text-slate-500' },
  medium:   { typeColor: 'text-violet-600', dot: 'bg-violet-500', detailColor: 'text-slate-500' },
  info:     { typeColor: 'text-slate-400',  dot: 'bg-slate-300',  detailColor: 'text-slate-400' },
} as const;

// ── Animated counter ─────────────────────────────────────────────────────────
function useAnimatedCount(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    const start = display;
    const startTime = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return display;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { state, injectAttack } = useAttackSimulation();

  // Merged event stream: seed + simulation events (newest first)
  const displayEvents: AttackEvent[] = state.liveEvents.length > 0
    ? [...state.liveEvents, ...SEED_EVENTS].slice(0, 10)
    : SEED_EVENTS;

  // Animated stats
  const eventCount    = useAnimatedCount(BASE_STATS.events    + state.statsDeltas.events    * 1240);
  const anomalyCount  = useAnimatedCount(BASE_STATS.anomalies + state.statsDeltas.anomalies);
  const threatCount   = useAnimatedCount(BASE_STATS.threats   + state.statsDeltas.threats);

  const isInjecting = state.phase !== 'idle' && state.phase !== 'resolved';

  return (
    <div className="px-8 py-8 max-w-[1440px] mx-auto">

      {/* ════════════════════════════════════════════════════════════════
          HERO CANVAS — Globe watermark spans behind stats + graph
      ════════════════════════════════════════════════════════════════ */}
      <div className="relative mb-6">

        {/* Giant Globe Watermark */}
        <div
          className="absolute top-[100px] left-[-140px] w-[700px] h-[700px] pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          <img
            src={SideGlobeImg}
            alt=""
            className="w-full h-full object-contain"
            style={{
              opacity: 0.75,
              mixBlendMode: 'multiply',
              WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 68%)',
              maskImage:       'radial-gradient(circle, black 35%, transparent 68%)',
            }}
          />
        </div>

        {/* ── TOP ROW: Headline + Quote ── */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="max-w-[400px]">
            <span className="text-[9px] uppercase font-bold tracking-[0.28em] text-slate-400 block mb-3">
              Real-Time Threat Intelligence
            </span>
            <h1 className="font-serif font-normal text-[52px] leading-[1.02] tracking-tight text-slate-900">
              See what<br />others miss.
            </h1>
            <p className="text-[13px] text-slate-500 mt-2.5 font-light">
              Uncover hidden connections. Stop attacks before they escalate.
            </p>

            {/* Stats row */}
            <div className="flex items-end gap-8 mt-7">
              <div>
                <div className="text-[26px] font-bold tracking-tight text-slate-900 tabular-nums">
                  {formatEvents(eventCount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  Events
                  <span className="text-[10px] font-mono font-semibold text-emerald-500">↑ 12%</span>
                </div>
              </div>
              <div>
                <div className={`text-[26px] font-bold tracking-tight tabular-nums transition-colors ${state.statsDeltas.anomalies > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {anomalyCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  Anomalies
                  {state.statsDeltas.anomalies > 0
                    ? <span className="text-[10px] font-mono font-semibold text-amber-500">↑ new</span>
                    : <span className="text-[10px] font-mono font-semibold text-emerald-500">↑ 6%</span>}
                </div>
              </div>
              <div>
                <div className={`text-[26px] font-bold tracking-tight tabular-nums transition-colors ${state.statsDeltas.threats > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {threatCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  Active Threats
                  <span className="text-[10px] font-mono font-semibold text-rose-500">
                    {state.statsDeltas.threats > 0 ? '↑ new' : '↑ 200%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote top-right */}
          <div className="max-w-[220px] text-right mt-2 shrink-0">
            <p className="font-serif italic text-[14.5px] text-slate-600 leading-relaxed">
              "It's not just about detecting threats, but understanding how they connect."
            </p>
            <div className="flex items-center justify-end gap-2 mt-3">
              <div className="w-6 h-px bg-slate-400" />
              <span className="text-[7.5px] tracking-[0.22em] font-bold text-slate-400 uppercase">
                Intelligence Creates Clarity
              </span>
            </div>
          </div>
        </div>

        {/* ── GRAPH SECTION ── */}
        <div className="relative z-10 -mt-4">
          <CorrelationGraph simulationState={state} />
        </div>

        {/* "A clearer view" caption */}
        <div className="absolute bottom-14 left-0 z-10 pointer-events-none">
          <p className="font-serif text-[17px] text-slate-700 leading-snug">
            A clearer view<br />of a safer world.
          </p>
          <div className="w-6 h-px bg-slate-400 mt-2.5" />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM — Live Event Stream + Mountain card
      ════════════════════════════════════════════════════════════════ */}
      <section aria-label="Event Telemetry" className="flex flex-col lg:flex-row gap-5">

        {/* Live Event Stream */}
        <div className="flex-[3] bg-white/90 rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <h3 className="font-semibold text-[13px] text-slate-900 tracking-tight">Live Event Stream</h3>
              {state.scenarioName && state.phase !== 'idle' && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                  {state.scenarioName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* ── INJECT ATTACK control — subtle security-tool style ── */}
              <button
                id="inject-attack-btn"
                onClick={injectAttack}
                disabled={isInjecting}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  isInjecting
                    ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-70'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/60 active:scale-95'
                }`}
                title="Simulate an attack scenario (frontend only — no real network requests)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {isInjecting ? 'Detecting…' : 'Inject Attack'}
              </button>

              <button className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition">
                View All
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100/80">
              {displayEvents.map((row, i) => {
                const cfg = SEV_CONFIG[row.severity] ?? SEV_CONFIG.info;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-default"
                    style={{
                      animation: i === 0 && state.liveEvents.length > 0 ? 'fadeInRow 0.4s ease both' : undefined,
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap w-[80px]">{row.time}</td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className={`text-[12px] font-semibold ${cfg.typeColor}`}>{row.label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 font-mono text-[11px] text-slate-500 w-[48px]">{row.method ?? '—'}</td>
                    <td className="px-2 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[160px]">{row.path ?? '—'}</td>
                    <td className="px-2 py-3 font-mono text-[11px] text-slate-400 w-[110px]">{row.ip ?? '—'}</td>
                    <td className={`px-2 py-3 text-[12px] ${cfg.detailColor} truncate max-w-[200px] pr-5`}>{row.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mountain card */}
        <div
          className="flex-1 min-w-[180px] rounded-3xl overflow-hidden relative flex flex-col justify-end border border-slate-200/50 shadow-sm"
          style={{ minHeight: 240 }}
        >
          <img src={MountainImg} alt="Mountain" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-white/10" />
          <div className="relative z-10 p-6">
            <h4 className="font-serif text-[22px] font-normal leading-tight tracking-tight text-slate-900">
              Turning<br />Data into<br />Security.
            </h4>
            <div className="w-5 h-px bg-slate-700 mt-3" />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; background: rgba(239,68,68,0.05); }
          to   { opacity: 1; background: transparent; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
