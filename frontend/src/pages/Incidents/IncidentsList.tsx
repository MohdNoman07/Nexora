import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Panel, SeverityTag, SEVERITY_COLOR, templateLabel, type Severity } from '../../components/ui';
import { format } from 'date-fns';

const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

const IncidentsList = () => {
  const navigate = useNavigate();
  const { incidents } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');

  const filtered = incidents.filter(inc => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      term === '' ||
      inc.id.toLowerCase().includes(term) ||
      templateLabel(inc.template_name).toLowerCase().includes(term) ||
      inc.description.toLowerCase().includes(term);
    const matchesSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-mono text-lg font-semibold tracking-tight text-text-primary">INCIDENTS</h1>

        <div className="flex items-center gap-2">
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-ink-1 border border-line rounded-sm py-1.5 pl-8 pr-7 text-sm font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[var(--color-signal-dim)] transition-colors"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex border border-line rounded-sm overflow-hidden">
            <button
              onClick={() => setSeverityFilter('All')}
              className={`px-2.5 py-1.5 text-[11px] font-mono transition-colors ${severityFilter === 'All' ? 'bg-ink-2 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              ALL
            </button>
            {SEVERITIES.map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1.5 text-[11px] font-mono border-l border-line transition-colors ${severityFilter === s ? 'bg-ink-2' : 'hover:bg-ink-2/50'}`}
                style={{ color: severityFilter === s ? SEVERITY_COLOR[s] : undefined }}
              >
                {s.slice(0, 4).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Panel>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-text-secondary mb-1">No incidents match this filter.</p>
            <p className="text-xs text-text-tertiary mb-3">Adjust the search term or severity filter.</p>
            {(searchTerm || severityFilter !== 'All') && (
              <button onClick={() => { setSearchTerm(''); setSeverityFilter('All'); }} className="text-xs font-mono hover:underline" style={{ color: 'var(--color-signal)' }}>
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-[10px] font-mono text-text-tertiary tracking-wide border-b border-line-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">SEVERITY</th>
                  <th className="px-5 py-3 font-medium">PATTERN</th>
                  <th className="px-5 py-3 font-medium">CONFIDENCE</th>
                  <th className="px-5 py-3 font-medium">WINDOW</th>
                  <th className="px-5 py-3 font-medium text-right">EVENTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {filtered.map(incident => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    className="cursor-pointer hover:bg-ink-2/40 transition-colors border-l-2"
                    style={{ borderLeftColor: SEVERITY_COLOR[incident.severity as Severity] ?? 'transparent' }}
                  >
                    <td className="px-5 py-3.5 font-mono text-text-primary font-medium">{incident.id}</td>
                    <td className="px-5 py-3.5"><SeverityTag severity={incident.severity} /></td>
                    <td className="px-5 py-3.5 text-text-secondary">{templateLabel(incident.template_name)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5 w-24">
                        <span className="readout text-xs text-text-secondary">{Math.round(incident.confidence * 100)}%</span>
                        <div className="h-1 w-full bg-[var(--color-line-soft)] overflow-hidden rounded-sm">
                          <div 
                            className="h-full" 
                            style={{ 
                              width: `${Math.round(incident.confidence * 100)}%`,
                              backgroundColor: SEVERITY_COLOR[incident.severity as Severity] ?? 'var(--color-text-tertiary)' 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-text-tertiary text-xs font-mono">
                      {format(new Date(incident.start_time), 'MMM d, HH:mm')} → {format(new Date(incident.end_time), 'HH:mm')}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs text-text-secondary">{incident.matched_events.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-line-soft px-5 py-3 text-xs font-mono text-text-tertiary">
          {filtered.length} of {incidents.length} incidents
        </div>
      </Panel>
    </div>
  );
};

export default IncidentsList;
