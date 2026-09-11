import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, User, Lock, Database, CheckCircle, ChevronRight, Activity } from 'lucide-react';
import { mockIncidentDetails } from '../../data/uiMockData';

const getIconForType = (iconType: string) => {
  switch (iconType) {
    case 'shield-alert': return <ShieldAlert className="w-4 h-4 text-accent-red" />;
    case 'user': return <User className="w-4 h-4 text-accent-blue" />;
    case 'lock': return <Lock className="w-4 h-4 text-accent-orange" />;
    case 'database': return <Database className="w-4 h-4 text-accent-red" />;
    default: return <Activity className="w-4 h-4 text-text-secondary" />;
  }
};

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const incidentData = id ? (mockIncidentDetails as Record<string, any>)[id] : null;

  if (!incidentData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Incident not found</h2>
        <Link to="/incidents" className="text-accent-blue hover:underline">Return to incidents</Link>
      </div>
    );
  }

  const { summary, timeline, evidence, correlationExplanation, recommendedAction } = incidentData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 text-sm mb-2 text-text-secondary">
        <Link to="/incidents" className="hover:text-text-primary transition-colors">Incidents</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-primary">{id}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{summary.attackType}</h1>
        <div className="flex gap-3">
          <button className="bg-panel border border-border px-4 py-2 rounded-md text-sm hover:border-text-tertiary transition-colors">
             Export Report
          </button>
          <button className="bg-accent-blue text-white px-4 py-2 rounded-md text-sm hover:bg-accent-blue/90 transition-colors shadow-sm font-medium">
             Take Action
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Correlation */}
        <div className="space-y-6">
          <div className="bg-panel border border-border rounded-xl p-5">
            <h2 className="font-semibold text-lg text-text-primary mb-4 border-b border-border pb-2">Incident Summary</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary text-sm">Severity</span>
                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-accent-red/10 text-accent-red border-accent-red/20`}>
                    <ShieldAlert className="w-3 h-3" />
                    {summary.severity}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary text-sm">Risk Score</span>
                 <span className="font-bold text-accent-red text-lg">{summary.riskScore}/100</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary text-sm">Status</span>
                 <span className="text-accent-orange text-sm flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-orange"></span> {summary.status}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary text-sm">Detection Time</span>
                 <span className="text-text-primary text-sm font-mono">{new Date(summary.detectionTime).toLocaleString()}</span>
               </div>
               <div className="pt-2 border-t border-border">
                 <span className="text-text-secondary text-sm block mb-2">Affected Entities</span>
                 <div className="flex flex-wrap gap-2">
                   {summary.affectedEntities.map((entity: string) => (
                     <span key={entity} className="bg-background border border-border px-2 py-1 rounded text-xs text-text-primary">{entity}</span>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-5 border-l-4 border-l-accent-blue">
            <h2 className="font-semibold text-lg text-text-primary mb-4 flex items-center gap-2">
               <Activity className="w-5 h-5 text-accent-blue" />
               Correlation AI
            </h2>
            <p className="text-sm text-text-secondary mb-4 leading-relaxed">
               {correlationExplanation.reason}
            </p>
            <div className="space-y-2 text-sm bg-background/50 p-3 rounded border border-border">
               <div className="flex justify-between"><span className="text-text-tertiary">Time Window:</span> <span className="text-text-primary">{correlationExplanation.timeWindow}</span></div>
               <div className="flex justify-between"><span className="text-text-tertiary">Shared Entities:</span> <span className="text-text-primary">{correlationExplanation.sharedEntities.join(', ')}</span></div>
               <div className="flex justify-between"><span className="text-text-tertiary">Pattern Matched:</span> <span className="text-accent-orange font-medium">{correlationExplanation.patternMatched}</span></div>
               <div className="flex justify-between mt-2 pt-2 border-t border-border"><span className="text-text-tertiary">Severity Boost:</span> <span className="text-accent-red font-medium">{correlationExplanation.severityBoost}</span></div>
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-5 border-l-4 border-l-accent-green">
            <h2 className="font-semibold text-lg text-text-primary mb-2 flex items-center gap-2">
               <CheckCircle className="w-5 h-5 text-accent-green" />
               Recommended Action
            </h2>
            <p className="text-sm text-text-primary leading-relaxed">
               {recommendedAction}
            </p>
          </div>
        </div>

        {/* Right Column: Timeline & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-panel border border-border rounded-xl p-5">
            <h2 className="font-semibold text-lg text-text-primary mb-6 border-b border-border pb-2">Attack Timeline</h2>
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
               {timeline.map((item: any, i: number) => (
                 <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-panel bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                      {getIconForType(item.icon)}
                   </div>
                   <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-border bg-background/50 hover:bg-background transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                         <span className="font-medium text-sm text-text-primary">{item.type}</span>
                         <span className="text-xs font-mono text-text-tertiary">{item.time}</span>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-panel border border-border rounded-xl p-0 overflow-hidden">
             <div className="p-5 border-b border-border">
               <h2 className="font-semibold text-lg text-text-primary">Evidence Chain</h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                 <thead className="text-xs text-text-tertiary uppercase bg-background/50 border-b border-border">
                   <tr>
                     <th className="px-5 py-3 font-medium">Time</th>
                     <th className="px-5 py-3 font-medium">Event Type</th>
                     <th className="px-5 py-3 font-medium">Resource</th>
                     <th className="px-5 py-3 font-medium">User/IP</th>
                     <th className="px-5 py-3 font-medium">Classification</th>
                     <th className="px-5 py-3 font-medium text-right">Anomaly</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {evidence.map((ev: any, i: number) => (
                     <tr key={i} className="hover:bg-background/50 transition-colors">
                       <td className="px-5 py-3 font-mono text-xs text-text-secondary">{ev.timestamp}</td>
                       <td className="px-5 py-3 font-medium text-text-primary">{ev.eventType}</td>
                       <td className="px-5 py-3 text-text-secondary truncate max-w-[150px]" title={ev.resource}>{ev.resource}</td>
                       <td className="px-5 py-3">
                         <div className="text-text-primary">{ev.user}</div>
                         <div className="text-xs font-mono text-text-tertiary">{ev.ip}</div>
                       </td>
                       <td className="px-5 py-3">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                           ev.classification === 'critical' ? 'bg-accent-red/20 text-accent-red' :
                           ev.classification === 'attack' ? 'bg-accent-orange/20 text-accent-orange' :
                           'bg-accent-blue/20 text-accent-blue'
                         }`}>
                           {ev.classification}
                         </span>
                       </td>
                       <td className="px-5 py-3 text-right">
                          <span className={`font-mono text-xs ${ev.anomalyScore > 0.9 ? 'text-accent-red' : 'text-accent-orange'}`}>
                            {ev.anomalyScore.toFixed(2)}
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
