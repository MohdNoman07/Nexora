import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Server, FileText, Users, Network, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Panel, SeverityTag, ScoreTag, EventIcon, eventLabel, templateLabel, SEVERITY_COLOR, type Severity } from '../../components/ui';
import { format } from 'date-fns';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { events, incidents } = useSimulation();
  const incident = incidents.find(inc => inc.id === id);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-text-tertiary">
        <AlertTriangle className="w-10 h-10 mb-4 opacity-40" />
        <h2 className="text-base font-mono text-text-primary mb-2">INCIDENT NOT FOUND</h2>
        <Link to="/incidents" className="text-sm hover:underline" style={{ color: 'var(--color-signal)' }}>Return to incidents</Link>
      </div>
    );
  }

  const { correlationExplanation, recommended_action } = incident;
  const chain = incident.matched_events
    .map(eid => events.find(e => e.id === eid))
    .filter((e): e is typeof events[0] => e !== undefined);

  const accentColor = SEVERITY_COLOR[incident.severity as Severity] ?? 'var(--color-sev-info)';

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
        <Link to="/incidents" className="hover:text-text-primary transition-colors">INCIDENTS</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text-primary">{id}</span>
      </div>

      {/* Header */}
      <div className="bg-ink-1 border border-line rounded-sm p-5" style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span className="font-mono text-text-secondary text-sm">{incident.id}</span>
          <SeverityTag severity={incident.severity} />
          <span className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: 'var(--color-sev-high)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-sev-high)' }} /> OPEN
          </span>
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">{templateLabel(incident.template_name)}</h1>
        <p className="text-sm text-text-secondary max-w-3xl mb-3">{incident.description}</p>
        <div className="flex items-center gap-6 text-xs font-mono text-text-tertiary flex-wrap">
          <span>WINDOW&nbsp;<span className="text-text-secondary">{format(new Date(incident.start_time), 'HH:mm:ss')} → {format(new Date(incident.end_time), 'HH:mm:ss')}</span></span>
          <span>CONFIDENCE&nbsp;<span className="readout text-text-secondary">{Math.round(incident.confidence * 100)}%</span></span>
          <span>EVENTS&nbsp;<span className="readout text-text-secondary">{chain.length}</span></span>
        </div>
      </div>

      {/* Correlation Graph */}
      <Panel title="CORRELATION GRAPH">
        <div className="p-0 overflow-x-auto bg-ink-2 relative group border-b border-line">
          {/* Subtle radial glow background for the graph area */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 transition-opacity duration-1000 group-hover:opacity-100">
            <div className="absolute top-1/2 left-[300px] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.15]" style={{ backgroundColor: accentColor }} />
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, var(--color-line) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.3 }} />
          </div>

          <div className="min-w-[800px] max-w-[900px] mx-auto h-[360px] relative">
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {/* Defs for gradients/markers if needed */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-text-tertiary)" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-signal)" />
                </marker>
              </defs>

              {/* Draw Links */}
              {chain.map((ev, i) => {
                const eventY = 60 + i * ((360 - 120) / Math.max(1, chain.length - 1));
                const isSelected = selectedEventId === ev.id;
                
                // IP to User link (drawn once)
                const ipToUser = i === 0 && incident.entity.user && incident.entity.ip;
                
                // User/IP to Event link
                const sourceX = incident.entity.user ? 300 : 150;
                const sourceY = 180;
                const targetX = 530;
                const targetY = eventY;

                return (
                  <g key={`link-${ev.id}`}>
                    {ipToUser && (
                      <path 
                        d="M 210 180 L 240 180" 
                        stroke="var(--color-text-tertiary)" 
                        strokeWidth="1.5" 
                        fill="none" 
                        markerEnd="url(#arrow)"
                      />
                    )}
                    <path
                      d={`M ${sourceX + 60} ${sourceY} C ${sourceX + 140} ${sourceY}, ${targetX - 80} ${targetY}, ${targetX} ${targetY}`}
                      stroke={isSelected ? 'var(--color-signal)' : 'var(--color-text-tertiary)'}
                      strokeWidth={isSelected ? "2" : "1.5"}
                      strokeDasharray={isSelected ? "none" : "4 4"}
                      fill="none"
                      markerEnd={isSelected ? "url(#arrow-active)" : "url(#arrow)"}
                      className={isSelected ? "animate-pulse" : "transition-all duration-300 opacity-60"}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes overlay (DOM for easy styling/interaction) */}
            
            {/* IP Node */}
            {incident.entity.ip && (
              <div className="absolute top-[180px] left-[150px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
                <div className="w-11 h-11 rounded-sm bg-ink-1 border flex items-center justify-center text-text-secondary shadow-lg" style={{ borderColor: 'var(--color-line-strong)' }}>
                  <Network className="w-4.5 h-4.5" />
                </div>
                <div className="text-[11px] font-mono font-semibold text-text-primary bg-ink-1 px-2 py-0.5 rounded-sm border shadow-sm" style={{ borderColor: 'var(--color-line-strong)' }}>
                  {incident.entity.ip}
                </div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Source IP</div>
              </div>
            )}

            {/* User Node */}
            {incident.entity.user && (
              <div className="absolute top-[180px] left-[300px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
                <div className="w-11 h-11 rounded-sm border flex items-center justify-center shadow-lg relative" style={{ backgroundColor: 'rgba(51,214,192,0.05)', borderColor: 'var(--color-signal-dim)' }}>
                  <div className="absolute inset-0 rounded-sm animate-pulse-live opacity-20" style={{ backgroundColor: 'var(--color-signal)' }} />
                  <Users className="w-4.5 h-4.5 relative z-10" style={{ color: 'var(--color-signal)' }} />
                </div>
                <div className="text-[11px] font-mono font-semibold text-text-primary bg-ink-1 px-2 py-0.5 rounded-sm border shadow-sm" style={{ borderColor: 'var(--color-signal-dim)' }}>
                  {incident.entity.user}
                </div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">User Account</div>
              </div>
            )}

            {/* Event Nodes */}
            {chain.map((ev, i) => {
              const eventY = 60 + i * ((360 - 120) / Math.max(1, chain.length - 1));
              const isSelected = selectedEventId === ev.id;
              
              return (
                <button
                  key={`node-${ev.id}`}
                  onClick={() => setSelectedEventId(ev.id === selectedEventId ? null : (ev.id as string))}
                  className="absolute left-[550px] -translate-y-1/2 flex items-center gap-4 transition-all duration-300 hover:z-20 group z-10"
                  style={{ top: eventY }}
                >
                  <div 
                    className="w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 transition-colors shadow-md relative"
                    style={{
                      borderColor: isSelected ? 'var(--color-signal)' : 'var(--color-line-strong)',
                      backgroundColor: isSelected ? 'rgba(51,214,192,0.1)' : 'var(--color-ink-1)',
                      color: isSelected ? 'var(--color-signal)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {isSelected && <div className="absolute inset-0 rounded-sm animate-ping opacity-20" style={{ backgroundColor: 'var(--color-signal)' }} />}
                    <EventIcon type={ev.event_type} className="w-4 h-4 relative z-10" />
                  </div>
                  <div className="flex flex-col items-start text-left bg-ink-1 border px-3 py-2 rounded-sm shadow-md transition-colors"
                    style={{ borderColor: isSelected ? 'var(--color-signal-dim)' : 'var(--color-line-strong)' }}>
                    <span className="text-[11px] font-mono font-semibold text-text-primary uppercase tracking-wide">{eventLabel(ev.event_type)}</span>
                    <span className="text-[10px] font-mono text-text-tertiary mt-0.5 readout">{format(new Date(ev.timestamp), 'HH:mm:ss')}</span>
                  </div>
                  
                  {/* Extract metadata summary if any */}
                  {ev.metadata && (
                    <div className="hidden sm:flex text-[9px] font-mono text-text-tertiary bg-ink-1 border border-line-soft px-2 py-1 rounded-sm">
                      {Object.entries(ev.metadata)[0].join(': ')}
                    </div>
                  )}
                  {ev.attack_label && (
                    <div className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--color-sev-critical)', backgroundColor: 'rgba(255,84,112,0.1)' }}>
                      {ev.attack_label.toUpperCase()}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Evidence timeline */}
        <Panel title="EVIDENCE TIMELINE" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-[10px] font-mono text-text-tertiary tracking-wide border-b border-line-soft">
                <tr>
                  <th className="px-5 py-2.5 font-medium">TIME</th>
                  <th className="px-5 py-2.5 font-medium">EVENT</th>
                  <th className="px-5 py-2.5 font-medium">USER / IP</th>
                  <th className="px-5 py-2.5 font-medium text-right">ANOMALY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {chain.map(ev => {
                  const isSelected = selectedEventId === ev.id;
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id === selectedEventId ? null : (ev.id as string))}
                      className="cursor-pointer transition-colors border-l-2"
                      style={{
                        backgroundColor: isSelected ? 'rgba(51,214,192,0.06)' : undefined,
                        borderLeftColor: isSelected ? 'var(--color-signal)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-3 readout text-xs text-text-secondary">{format(new Date(ev.timestamp), 'HH:mm:ss')}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                            <EventIcon type={ev.event_type} />
                            {eventLabel(ev.event_type)}
                          </span>
                          {ev.attack_label && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--color-sev-critical)', backgroundColor: 'rgba(255,84,112,0.1)' }}>
                              {ev.attack_label.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-text-primary text-xs">{ev.user}</div>
                        <div className="text-[11px] readout text-text-tertiary">{ev.ip}</div>
                      </td>
                      <td className="px-5 py-3 text-right"><ScoreTag value={ev.anomaly_score} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Right column */}
        <div className="space-y-5">
          {correlationExplanation && (
            <Panel title="CORRELATION ENGINE" subtitle="Why these events were linked" accent="var(--color-signal)">
              <div className="p-4 space-y-4">
                <Field icon={Users} label="ENTITY MATCH">
                  {correlationExplanation.sharedEntities.map(e => (
                    <div key={e} className="text-sm text-text-secondary">{e}</div>
                  ))}
                </Field>
                <Field icon={Network} label="TEMPORAL PROXIMITY">
                  <div className="text-sm text-text-secondary">{correlationExplanation.timeWindow} correlation window</div>
                </Field>
                <Field icon={Server} label="PATTERN MATCH">
                  <div className="text-sm font-mono" style={{ color: 'var(--color-sev-high)' }}>{correlationExplanation.patternMatched}</div>
                </Field>
                <Field icon={AlertTriangle} label="RISK CONTRIBUTION">
                  <div className="text-sm" style={{ color: 'var(--color-sev-critical)' }}>{correlationExplanation.severityBoost}</div>
                </Field>
              </div>
            </Panel>
          )}

          <Panel title="RECOMMENDED ACTION" accent="var(--color-sev-low)">
            <ul className="p-4 space-y-2.5">
              {recommended_action.map((action, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-signal)' }} />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, children }: { icon: typeof FileText; label: string; children: React.ReactNode }) => (
  <div className="pt-3 first:pt-0 border-t first:border-t-0 border-line-soft">
    <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary tracking-wide mb-1.5">
      <Icon className="w-3 h-3" /> {label}
    </div>
    {children}
  </div>
);

export default IncidentDetail;
