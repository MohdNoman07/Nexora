import { Link } from 'react-router-dom';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ShieldAlert, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { format } from 'date-fns';

const getIncidentLabel = (templateName: string): string => {
  const labels: Record<string, string> = {
    credential_compromise_exfiltration: 'Credential Stuffing → Data Exfiltration',
    port_scan_detected: 'Port Scan / Reconnaissance',
    brute_force_attack: 'Brute Force Attack',
  };
  return labels[templateName] ?? templateName.replace(/_/g, ' ').toUpperCase();
};

const Dashboard = () => {
  const { events: mockEvents, incidents: mockIncidents } = useSimulation();
  // Compute metrics
  const totalEvents = mockEvents.length;
  // Events with an attack_label have been classified by the injector as confirmed attack events.
  // This is the only grounded 'flagging' criterion in the current pipeline.
  const labelledAttackEvents = mockEvents.filter(e => e.attack_label !== undefined).length;
  const openIncidents = mockIncidents.length;
  const criticalIncidents = mockIncidents.filter(i => i.severity === 'Critical').length;

  // Chart data: sort events by time, format for Recharts
  const chartData = [...mockEvents]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(e => ({
      time: format(new Date(e.timestamp), 'HH:mm:ss'),
      score: e.anomaly_score,
      label: e.attack_label || 'normal'
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Security Overview</h1>
        <p className="text-text-secondary">
          Monitor suspicious activity and reconstructed security incidents across the simulated organisation.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Events" value={totalEvents} icon={<Activity className="text-accent-blue w-5 h-5" />} />
        <MetricCard title="Attack-Labeled Events" value={labelledAttackEvents} icon={<AlertTriangle className="text-accent-orange w-5 h-5" />} />
        <MetricCard title="Open Incidents" value={openIncidents} icon={<AlertTriangle className="text-accent-orange w-5 h-5" />} />
        <MetricCard title="Critical Incidents" value={criticalIncidents} icon={<ShieldAlert className="text-accent-red w-5 h-5" />} isAlert={criticalIncidents > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-xl p-5 flex flex-col shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-lg text-text-primary">Event Anomaly Scores</h2>
            <p className="text-sm text-text-secondary">Scores shown from the simulated event stream</p>
          </div>
          <div className="flex-1 min-h-[300px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis dataKey="score" domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  labelStyle={{ color: '#475569', marginBottom: '4px' }}
                />
                <Scatter data={chartData} shape="circle">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 0.8 ? '#ef4444' : entry.score >= 0.5 ? '#f97316' : '#64748b'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Preview */}
        <div className="bg-panel border border-border rounded-xl p-5 flex flex-col shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-lg text-text-primary">Correlation Engine</h2>
            <p className="text-sm text-text-secondary">Example reconstructed attack chain</p>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center py-6 bg-background/50 rounded-lg border border-border px-4">
            <div className="flex items-center gap-3 w-full justify-center flex-wrap">
              <div className="flex flex-col items-center gap-2 p-3 bg-panel border border-border rounded shadow-sm min-w-[110px]">
                 <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Entity Match</span>
                 <div className="text-sm font-bold text-text-primary">j.patel</div>
                 <div className="text-xs text-text-secondary font-mono">203.0.113.14</div>
              </div>
              <ArrowRight className="w-5 h-5 text-accent-blue shrink-0" />
              <div className="flex flex-col items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded shadow-sm min-w-[110px]">
                 <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Pattern</span>
                 <div className="text-sm font-bold text-orange-800 text-center">Credential<br/>Stuffing</div>
              </div>
              <ArrowRight className="w-5 h-5 text-accent-red shrink-0" />
              <div className="flex flex-col items-center gap-2 p-3 bg-red-50 border border-red-200 rounded shadow-sm min-w-[110px]">
                 <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Impact</span>
                 <div className="text-sm font-bold text-red-800 text-center">Data<br/>Exfiltration</div>
              </div>
            </div>
            <div className="mt-6 text-xs text-text-secondary bg-panel px-4 py-2 rounded-full border border-border shadow-sm flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-accent-blue"></span>
               Correlation Window: <span className="font-medium text-text-primary">3 minutes</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Active Incidents */}
         <div className="bg-panel border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/30">
              <h2 className="font-semibold text-lg text-text-primary">Active Incidents</h2>
              <Link to="/incidents" className="text-sm font-medium text-accent-blue hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-border">
              {mockIncidents.map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="block p-4 hover:bg-background transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{inc.id}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <span className="text-xs font-medium text-text-tertiary bg-border px-2 py-0.5 rounded">
                      {Math.round(inc.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary mb-3 font-medium">
                    {getIncidentLabel(inc.template_name)}
                  </div>
                  <div className="flex gap-4 text-xs text-text-tertiary">
                    <span>{inc.matched_events.length} events</span>
                    <span>•</span>
                    <span>{format(new Date(inc.start_time), 'MMM d, HH:mm')}</span>
                  </div>
                </Link>
              ))}
            </div>
         </div>

         {/* Recent Activity */}
         <div className="bg-panel border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex justify-between items-center bg-background/30">
              <h2 className="font-semibold text-lg text-text-primary">Recent Activity</h2>
              <Link to="/live" className="text-sm font-medium text-accent-blue hover:underline">Live Feed</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-text-tertiary uppercase bg-background border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Event Type</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...mockEvents].reverse().slice(0, 6).map(ev => (
                    <tr key={ev.id} className="hover:bg-background transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{format(new Date(ev.timestamp), 'HH:mm:ss')}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-border text-text-secondary uppercase tracking-wider">
                          {ev.event_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`font-mono text-xs font-medium ${ev.anomaly_score > 0.8 ? 'text-accent-red' : ev.anomaly_score > 0.5 ? 'text-accent-orange' : 'text-text-secondary'}`}>
                           {ev.anomaly_score.toFixed(2)}
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
  );
};

const MetricCard = ({ title, value, icon, isAlert }: { title: string, value: number, icon: React.ReactNode, isAlert?: boolean }) => {
  return (
    <div className={`bg-panel border ${isAlert ? 'border-accent-red/30' : 'border-border'} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className={`p-2 rounded-lg ${isAlert ? 'bg-accent-red/10' : 'bg-background'}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-text-primary">{value}</div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors = {
    Critical: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-blue-50 text-blue-700 border-blue-200',
  }[severity] || 'bg-slate-50 text-slate-700 border-slate-200';
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colors}`}>
      {severity}
    </span>
  );
};

export default Dashboard;
