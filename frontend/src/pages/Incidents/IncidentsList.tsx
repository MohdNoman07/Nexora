import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { mockIncidents } from '../../data/uiMockData';

const IncidentsList = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <div className="flex gap-3">
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
             <input type="text" placeholder="Search incidents..." className="w-full bg-panel border border-border rounded-md py-1.5 pl-9 pr-3 text-sm text-text-primary focus:outline-none focus:border-text-tertiary" />
          </div>
          <button className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md text-sm hover:border-text-tertiary transition-colors">
             <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>
      
      <div className="bg-panel border border-border rounded-xl overflow-hidden flex flex-col">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left whitespace-nowrap">
             <thead className="text-xs text-text-tertiary uppercase bg-background/50 border-b border-border">
               <tr>
                 <th className="px-6 py-4 font-medium">Incident ID</th>
                 <th className="px-6 py-4 font-medium">Severity</th>
                 <th className="px-6 py-4 font-medium">Attack Type</th>
                 <th className="px-6 py-4 font-medium">Status</th>
                 <th className="px-6 py-4 font-medium">First Detected</th>
                 <th className="px-6 py-4 font-medium">Source IP</th>
                 <th className="px-6 py-4 font-medium">User</th>
                 <th className="px-6 py-4 font-medium text-right">Events</th>
                 <th className="px-6 py-4 font-medium"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {mockIncidents.map((incident) => (
                 <tr key={incident.id} className="hover:bg-background/50 transition-colors group">
                   <td className="px-6 py-4">
                     <Link to={`/incidents/${incident.id}`} className="font-medium text-text-primary hover:text-accent-blue transition-colors">
                       {incident.id}
                     </Link>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                       incident.severity === 'Critical' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' :
                       incident.severity === 'High' ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/20' :
                       'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
                     }`}>
                        {incident.severity === 'Critical' && <ShieldAlert className="w-3 h-3" />}
                        {incident.severity === 'High' && <AlertTriangle className="w-3 h-3" />}
                        {incident.severity}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-text-secondary">{incident.attackType}</td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 ${incident.status === 'Open' ? 'text-accent-orange' : 'text-text-secondary'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'Open' ? 'bg-accent-orange' : 'bg-text-tertiary'}`}></span>
                       {incident.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-text-secondary">{new Date(incident.firstDetected).toLocaleString()}</td>
                   <td className="px-6 py-4 font-mono text-xs text-text-secondary">{incident.sourceIp}</td>
                   <td className="px-6 py-4 text-text-secondary">{incident.user}</td>
                   <td className="px-6 py-4 text-right">
                     <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-border text-xs">
                       {incident.eventsCount}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     <Link to={`/incidents/${incident.id}`} className="text-text-tertiary group-hover:text-text-primary transition-colors">
                       View →
                     </Link>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         <div className="border-t border-border p-4 flex items-center justify-between text-sm text-text-secondary">
           <div>Showing 1 to 2 of 2 entries</div>
           <div className="flex gap-1">
             <button className="p-1 rounded hover:bg-border transition-colors"><ChevronLeft className="w-5 h-5" /></button>
             <button className="p-1 rounded hover:bg-border transition-colors"><ChevronRight className="w-5 h-5" /></button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default IncidentsList;
