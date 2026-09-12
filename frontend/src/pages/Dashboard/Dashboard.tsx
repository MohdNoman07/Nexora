import { Link } from 'react-router-dom';
import { Area, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, ComposedChart } from 'recharts';
import { useSimulation } from '../../context/SimulationContext';
import { Panel, SeverityTag, ScoreTag, eventLabel, templateLabel, SEVERITY_COLOR, type Severity } from '../../components/ui';
import { format } from 'date-fns';

const Dashboard = () => {
  const { events, incidents } = useSimulation();

  const totalEvents = events.length;
  const labelledAttackEvents = events.filter(e => e.attack_label !== undefined).length;
  const openIncidents = incidents.length;
  const criticalIncidents = incidents.filter(i => i.severity === 'Critical').length;

  const chartData = [...events]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(e => ({
      time: format(new Date(e.timestamp), 'HH:mm:ss'),
      score: e.anomaly_score,
    }));

  // Most recently reconstructed incident drives the correlation preview —
  // this reflects live state instead of a fixed illustrative example.
  const latest = incidents[0];

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      <div>
        <h1 className="font-mono text-lg font-semibold tracking-tight text-text-primary">SECURITY OVERVIEW</h1>
        <p className="text-sm text-text-tertiary mt-1">Simulated organisational activity — suspicious events and reconstructed incidents.</p>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-sm overflow-hidden">
        <Readout label="TOTAL EVENTS" value={totalEvents} />
        <Readout label="ATTACK-LABELED" value={labelledAttackEvents} color="var(--color-sev-high)" />
        <Readout label="OPEN INCIDENTS" value={openIncidents} color="var(--color-sev-high)" />
        <Readout label="CRITICAL" value={criticalIncidents} color={criticalIncidents > 0 ? 'var(--color-sev-critical)' : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="ANOMALY SCORE" subtitle="Simulated event stream, by time" className="lg:col-span-2">
          <div className="h-[280px] p-4 relative group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-signal-dim),transparent_50%)] opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-signal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-signal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a222b" vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="time" axisLine={{ stroke: '#232d38' }} tickLine={false} tick={{ fontSize: 11, fill: '#56626d', fontFamily: 'IBM Plex Mono' }} dy={8} />
                <YAxis dataKey="score" domain={[0, 1]} axisLine={{ stroke: '#232d38' }} tickLine={false} tick={{ fontSize: 11, fill: '#56626d', fontFamily: 'IBM Plex Mono' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151d26', borderColor: '#232d38', borderRadius: 2, fontFamily: 'IBM Plex Mono', fontSize: 12 }}
                  itemStyle={{ color: '#e7edf2' }}
                  labelStyle={{ color: '#8b98a5' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--color-signal)" strokeWidth={1.5} fillOpacity={1} fill="url(#scoreGradient)" isAnimationActive={false} />
                <Scatter dataKey="score" shape="circle">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 0.8 ? '#ff5470' : entry.score >= 0.5 ? '#ffa53d' : '#33d6c0'} />
                  ))}
                </Scatter>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="CORRELATION ENGINE" subtitle={latest ? `Most recent reconstruction — ${latest.id}` : 'Awaiting first incident'}>
          {latest ? (() => {
            const sevColor = SEVERITY_COLOR[latest.severity as Severity] ?? 'var(--color-text-secondary)';
            const confidence = Math.round(latest.confidence * 100);
            const pattern = latest.correlationExplanation?.patternMatched || templateLabel(latest.template_name);
            const patternParts = pattern.split('→').map((p: string) => p.trim());
            const entities = Object.entries(latest.entity).filter(([, v]) => v);

            return (
              <div className="flex-1 flex flex-col">
                {/* Top: severity badge + risk score */}
                <div className="flex items-stretch border-b" style={{ borderColor: 'var(--color-line-soft)' }}>
                  <div className="flex-1 p-4 flex flex-col justify-center border-r" style={{ borderColor: 'var(--color-line-soft)' }}>
                    <div className="text-[9px] font-mono tracking-widest mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>SEVERITY</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: sevColor }} />
                      <span className="font-mono text-base font-bold tracking-wide" style={{ color: sevColor }}>
                        {latest.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="text-[9px] font-mono tracking-widest mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>CONFIDENCE</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-sm overflow-hidden" style={{ backgroundColor: 'var(--color-line)' }}>
                        <div className="h-full rounded-sm transition-all" style={{ width: `${confidence}%`, backgroundColor: sevColor }} />
                      </div>
                      <span className="readout text-sm font-semibold text-text-primary shrink-0">{confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Middle: attack chain pattern */}
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-line-soft)' }}>
                  <div className="text-[9px] font-mono tracking-widest mb-3" style={{ color: 'var(--color-text-tertiary)' }}>ATTACK CHAIN PATTERN</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {patternParts.map((part: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span
                          className="text-[11px] font-mono font-semibold px-2 py-1 rounded-sm"
                          style={{ backgroundColor: 'rgba(51,214,192,0.08)', color: 'var(--color-signal)', border: '1px solid var(--color-signal-dim)' }}
                        >
                          {part}
                        </span>
                        {i < patternParts.length - 1 && (
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom: entities + event count */}
                <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4 flex-1">
                  <div>
                    <div className="text-[9px] font-mono tracking-widest mb-2" style={{ color: 'var(--color-text-tertiary)' }}>CORRELATED ENTITIES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {entities.map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border"
                          style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-ink-2)' }}>
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-signal)' }} />
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="readout text-3xl font-bold leading-none" style={{ color: 'var(--color-signal)' }}>
                      {latest.matched_events.length}
                    </div>
                    <div className="text-[9px] font-mono tracking-widest mt-1" style={{ color: 'var(--color-text-tertiary)' }}>EVENTS</div>
                  </div>
                </div>

                <div className="border-t px-4 py-2.5" style={{ borderColor: 'var(--color-line-soft)', backgroundColor: 'var(--color-ink-2)' }}>
                  <Link to={`/incidents/${latest.id}`}
                    className="text-[10px] font-mono font-semibold tracking-widest hover:underline flex items-center gap-1.5"
                    style={{ color: 'var(--color-signal)' }}>
                    VIEW FULL RECONSTRUCTION →
                  </Link>
                </div>
              </div>
            );
          })() : (
            <div className="flex-1 flex items-center justify-center py-10 text-sm text-text-tertiary">No incidents reconstructed yet.</div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="ACTIVE INCIDENTS" action={<Link to="/incidents" className="text-xs font-mono hover:underline" style={{ color: 'var(--color-signal)' }}>ALL →</Link>}>
          <div className="divide-y divide-[var(--color-line-soft)]">
            {incidents.slice(0, 6).map(inc => {
              const sevColor = SEVERITY_COLOR[inc.severity as Severity] ?? 'transparent';
              return (
                <Link key={inc.id} to={`/incidents/${inc.id}`} 
                  className="block p-4 hover:bg-ink-2/50 transition-colors border-l-2 relative group"
                  style={{ borderLeftColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = sevColor}
                  onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = 'transparent'}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" 
                    style={{ background: `linear-gradient(90deg, ${sevColor}, transparent)` }} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-text-primary">{inc.id}</span>
                        <SeverityTag severity={inc.severity} />
                      </div>
                      <span className="readout text-xs text-text-tertiary">{Math.round(inc.confidence * 100)}%</span>
                    </div>
                    <div className="text-sm text-text-secondary mb-2">{templateLabel(inc.template_name)}</div>
                    <div className="flex gap-3 text-[11px] font-mono text-text-tertiary">
                      <span>{inc.matched_events.length} EVENTS</span>
                      <span>{format(new Date(inc.start_time), 'MMM d, HH:mm').toUpperCase()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title="RECENT ACTIVITY" action={<Link to="/live" className="text-xs font-mono hover:underline" style={{ color: 'var(--color-signal)' }}>LIVE →</Link>}>
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-mono text-text-tertiary border-b border-line-soft">
              <tr>
                <th className="px-4 py-2 font-medium">TIME</th>
                <th className="px-4 py-2 font-medium">EVENT</th>
                <th className="px-4 py-2 font-medium text-right">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line-soft)]">
              {[...events].reverse().slice(0, 6).map(ev => (
                <tr key={ev.id}>
                  <td className="px-4 py-2.5 readout text-xs text-text-secondary">{format(new Date(ev.timestamp), 'HH:mm:ss')}</td>
                  <td className="px-4 py-2.5 text-xs text-text-secondary">{eventLabel(ev.event_type)}</td>
                  <td className="px-4 py-2.5 text-right"><ScoreTag value={ev.anomaly_score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};

const Readout = ({ label, value, color }: { label: string; value: number; color?: string }) => {
  return (
    <div className="bg-ink-1 p-4 relative overflow-hidden group" style={{ borderLeftWidth: color ? '3px' : '0', borderLeftColor: color }}>
      {color && (
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none"
             style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      )}
      <div className="text-[10px] font-mono text-text-tertiary tracking-wide mb-1.5 relative z-10">{label}</div>
      <div className="readout text-3xl font-bold tracking-tight relative z-10" style={{ color: color ?? 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
};



export default Dashboard;
