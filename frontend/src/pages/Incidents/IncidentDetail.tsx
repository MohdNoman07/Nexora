import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Lock, Database, CheckCircle, ChevronRight, Activity, Server, FileText, Users, Network } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { format } from 'date-fns';

// Maps a template_name to a human-readable attack pattern label
const getIncidentLabel = (templateName: string): string => {
  const labels: Record<string, string> = {
    credential_compromise_exfiltration: 'Credential Stuffing → Data Exfiltration',
    port_scan_detected: 'Port Scan / Reconnaissance',
    brute_force_attack: 'Brute Force Attack',
  };
  return labels[templateName] ?? templateName.replace(/_/g, ' ').toUpperCase();
};

const getIconForType = (eventType: string) => {
  if (eventType.includes('auth_login_failure')) return <Lock className="w-3.5 h-3.5 text-accent-orange" />;
  if (eventType.includes('auth_login_success')) return <Lock className="w-3.5 h-3.5 text-accent-green" />;
  if (eventType.includes('db')) return <Database className="w-3.5 h-3.5 text-accent-red" />;
  if (eventType.includes('file')) return <FileText className="w-3.5 h-3.5 text-text-secondary" />;
  if (eventType.includes('data_exfil')) return <Activity className="w-3.5 h-3.5 text-accent-red" />;
  if (eventType.includes('port')) return <Network className="w-3.5 h-3.5 text-accent-blue" />;
  if (eventType.includes('brute')) return <Lock className="w-3.5 h-3.5 text-accent-red" />;
  return <Activity className="w-3.5 h-3.5 text-text-secondary" />;
};

const getEventLabel = (eventType: string): string => {
  const labels: Record<string, string> = {
    auth_login_failure: 'Auth Failure',
    auth_login_success: 'Auth Success',
    db_query: 'DB Query',
    file_access: 'File Access',
    data_exfiltration: 'Data Exfiltration',
    port_scan: 'Port Scan',
    brute_force_attempt: 'Brute Force',
    api_call: 'API Call',
  };
  return labels[eventType] ?? eventType.replace(/_/g, ' ');
};

const getChainNodeStyle = (eventType: string): string => {
  if (eventType === 'data_exfiltration') return 'border-red-300 bg-red-50';
  if (eventType === 'auth_login_failure' || eventType === 'brute_force_attempt') return 'border-orange-200 bg-orange-50';
  if (eventType === 'auth_login_success') return 'border-green-200 bg-green-50';
  if (eventType === 'db_query') return 'border-red-200 bg-red-50/50';
  return 'border-slate-200 bg-white';
};

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { events: mockEvents, incidents: mockIncidents } = useSimulation();
  const incidentData = mockIncidents.find(inc => inc.id === id);

  if (!incidentData) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-text-tertiary">
        <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Incident not found</h2>
        <Link to="/incidents" className="text-accent-blue hover:underline">Return to incidents</Link>
      </div>
    );
  }

  const { correlationExplanation, recommended_action } = incidentData;
  const matchedEventsData = incidentData.matched_events
    .map(eventId => mockEvents.find(e => e.id === eventId))
    .filter((e): e is typeof mockEvents[0] => e !== undefined);

  const incidentLabel = getIncidentLabel(incidentData.template_name);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/incidents" className="hover:text-text-primary transition-colors">Incidents</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-primary font-medium">{id}</span>
      </div>
      
      {/* Header */}
      <div className="bg-panel border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-text-secondary text-sm">{incidentData.id}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                incidentData.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                incidentData.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {incidentData.severity}
              </span>
              <span className="text-accent-orange text-xs flex items-center gap-1.5 font-medium bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange"></span> Open
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">{incidentLabel}</h1>
            <div className="flex items-center gap-6 mt-1 text-sm text-text-secondary flex-wrap">
              <div>
                <span className="text-text-tertiary">Time range: </span>
                <span className="font-medium text-text-primary">
                  {format(new Date(incidentData.start_time), 'HH:mm:ss')} → {format(new Date(incidentData.end_time), 'HH:mm:ss')}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Confidence: </span>
                <span className="font-medium text-text-primary">{Math.round(incidentData.confidence * 100)}%</span>
              </div>
              <div>
                <span className="text-text-tertiary">Events: </span>
                <span className="font-medium text-text-primary">{matchedEventsData.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attack Chain — single continuous horizontal flow, wraps on narrow screens */}
      <div className="bg-panel border border-border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-text-primary mb-5">Reconstructed Attack Chain</h2>
        <div className="bg-background/60 rounded-lg border border-border p-6 overflow-x-auto">
          <div className="flex items-start flex-wrap gap-0 min-w-0">
            {matchedEventsData.map((ev, idx) => (
              <div key={ev.id} className="flex items-center">
                {/* Node */}
                <div 
                  onClick={() => setSelectedEventId(ev.id === selectedEventId ? null : (ev.id as string))}
                  className={`flex flex-col items-center border rounded-lg p-3 w-[110px] shrink-0 shadow-sm cursor-pointer transition-all ${getChainNodeStyle(ev.event_type)} ${selectedEventId === ev.id ? 'ring-2 ring-accent-blue ring-offset-2 scale-105 bg-accent-blue/5' : 'hover:scale-105'}`}
                >
                  <span className="mb-2">{getIconForType(ev.event_type)}</span>
                  <span className="text-[11px] font-bold text-text-primary text-center leading-tight">
                    {getEventLabel(ev.event_type)}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono mt-1">
                    {format(new Date(ev.timestamp), 'HH:mm:ss')}
                  </span>
                  <span className={`text-[10px] font-mono mt-1 ${ev.anomaly_score >= 0.8 ? 'text-accent-red' : 'text-text-tertiary'}`}>
                    {ev.anomaly_score.toFixed(2)}
                  </span>
                </div>
                {/* Arrow between nodes */}
                {idx < matchedEventsData.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-text-tertiary shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence Timeline */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border bg-background/30">
            <h2 className="font-semibold text-lg text-text-primary">Evidence Timeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-text-tertiary uppercase bg-background border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">User / IP</th>
                  <th className="px-5 py-3 font-medium text-right">Anomaly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matchedEventsData.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  return (
                  <tr 
                    key={ev.id} 
                    onClick={() => setSelectedEventId(ev.id === selectedEventId ? null : (ev.id as string))}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : 'hover:bg-background/80 border-l-2 border-transparent'}`}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-text-secondary">
                      {format(new Date(ev.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {getIconForType(ev.event_type)}
                          {ev.event_type.replace(/_/g, ' ')}
                        </span>
                        {ev.attack_label && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                            {ev.attack_label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-text-primary">{ev.user}</div>
                      <div className="text-xs font-mono text-text-tertiary">{ev.ip}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono text-xs font-medium px-2 py-1 rounded border ${
                        ev.anomaly_score >= 0.8 ? 'text-accent-red border-red-200 bg-red-50' : 
                        ev.anomaly_score >= 0.5 ? 'text-accent-orange border-orange-200 bg-orange-50' : 
                        'text-text-secondary border-slate-200 bg-slate-50'
                      }`}>
                        {ev.anomaly_score.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Correlation Engine */}
          {correlationExplanation && (
            <div className="bg-panel border border-border rounded-xl p-5 shadow-sm border-t-4 border-t-accent-blue">
              <h2 className="font-semibold text-base text-text-primary mb-1 flex items-center gap-2">
                <Server className="w-4 h-4 text-accent-blue" />
                Correlation Engine
              </h2>
              <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wider font-semibold">
                Why these events were linked
              </p>

              {/* Entity Match */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-text-tertiary" /> Entity Match
                </h3>
                <ul className="space-y-1.5">
                  {correlationExplanation.sharedEntities.map(entity => (
                    <li key={entity} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0"></span>
                      {entity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Temporal Proximity */}
              <div className="mb-4 pt-3 border-t border-border">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-text-tertiary" /> Temporal Proximity
                </h3>
                <div className="text-sm text-text-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0"></span>
                  {correlationExplanation.timeWindow} correlation window
                </div>
              </div>

              {/* Pattern Match */}
              <div className="mb-4 pt-3 border-t border-border">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-text-tertiary" /> Pattern Match
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  {correlationExplanation.patternMatched}
                </span>
              </div>

              {/* Risk Contribution */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-text-tertiary" /> Risk Contribution
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  {correlationExplanation.severityBoost}
                </span>
              </div>
            </div>
          )}

          {/* Analyst Recommendations */}
          <div className="bg-panel border border-border rounded-xl p-5 shadow-sm border-t-4 border-t-accent-green">
            <h2 className="font-semibold text-base text-text-primary mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              Analyst Recommendations
            </h2>
            <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wider font-semibold">
              Suggested response actions
            </p>
            <ul className="space-y-3">
              {recommended_action.map((action, i) => (
                <li key={i} className="flex gap-3 text-sm text-text-primary leading-relaxed">
                  <span className="mt-0.5 text-accent-green font-bold shrink-0">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
