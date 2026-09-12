import { Link } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Panel, SeverityTag, ScoreTag, eventLabel, templateLabel } from '../../components/ui';
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
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1a222b" vertical={false} />
                <XAxis dataKey="time" axisLine={{ stroke: '#232d38' }} tickLine={false} tick={{ fontSize: 11, fill: '#56626d', fontFamily: 'IBM Plex Mono' }} dy={8} />
                <YAxis dataKey="score" domain={[0, 1]} axisLine={{ stroke: '#232d38' }} tickLine={false} tick={{ fontSize: 11, fill: '#56626d', fontFamily: 'IBM Plex Mono' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151d26', borderColor: '#232d38', borderRadius: 2, fontFamily: 'IBM Plex Mono', fontSize: 12 }}
                  itemStyle={{ color: '#e7edf2' }}
                  labelStyle={{ color: '#8b98a5' }}
                />
                <Scatter data={chartData} shape="circle">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 0.8 ? '#ff5470' : entry.score >= 0.5 ? '#ffa53d' : '#56626d'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="CORRELATION ENGINE" subtitle={latest ? `Most recent reconstruction — ${latest.id}` : 'Awaiting first incident'}>
          {latest ? (
            <div className="flex-1 flex flex-col justify-center items-center py-6 px-4">
              <div className="flex items-center gap-2 w-full justify-center flex-wrap">
                <SchematicNode label="ENTITY" value={Object.values(latest.entity)[0] ?? '—'} sub={Object.values(latest.entity)[1]} color="var(--color-signal)" />
                <ArrowRight className="w-4 h-4 shrink-0 text-text-tertiary" />
                <SchematicNode label="PATTERN" value={latest.correlationExplanation?.patternMatched || templateLabel(latest.template_name)} color="var(--color-sev-high)" />
                <ArrowRight className="w-4 h-4 shrink-0 text-text-tertiary" />
                <SchematicNode label="SEVERITY" value={latest.severity} color="var(--color-sev-critical)" />
              </div>
              <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-text-tertiary">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-signal)' }} />
                {latest.matched_events.length} correlated events
              </div>
              <Link to={`/incidents/${latest.id}`} className="mt-3 text-xs font-mono hover:underline" style={{ color: 'var(--color-signal)' }}>
                VIEW RECONSTRUCTION →
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-10 text-sm text-text-tertiary">No incidents reconstructed yet.</div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="ACTIVE INCIDENTS" action={<Link to="/incidents" className="text-xs font-mono hover:underline" style={{ color: 'var(--color-signal)' }}>ALL →</Link>}>
          <div className="divide-y divide-[var(--color-line-soft)]">
            {incidents.slice(0, 6).map(inc => (
              <Link key={inc.id} to={`/incidents/${inc.id}`} className="block p-4 hover:bg-ink-2/50 transition-colors">
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
              </Link>
            ))}
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

const Readout = ({ label, value, color }: { label: string; value: number; color?: string }) => (
  <div className="bg-ink-1 p-4">
    <div className="text-[10px] font-mono text-text-tertiary tracking-wide mb-1.5">{label}</div>
    <div className="readout text-2xl font-semibold" style={{ color: color ?? 'var(--color-text-primary)' }}>{value}</div>
  </div>
);

const SchematicNode = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) => (
  <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 bg-ink-2 border rounded-sm min-w-[100px]" style={{ borderColor: color + '40' }}>
    <span className="text-[9px] font-mono tracking-wide" style={{ color }}>{label}</span>
    <span className="text-xs font-mono font-semibold text-text-primary text-center leading-tight">{value}</span>
    {sub && <span className="text-[10px] font-mono text-text-tertiary">{sub}</span>}
  </div>
);

export default Dashboard;
