import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldAlert, Search, Filter, X } from 'lucide-react';
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

const IncidentsList = () => {
  const navigate = useNavigate();
  const { incidents: mockIncidents } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredIncidents = mockIncidents.filter(inc => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = term === '' || 
      inc.id.toLowerCase().includes(term) ||
      getIncidentLabel(inc.template_name).toLowerCase().includes(term) ||
      inc.description.toLowerCase().includes(term);
      
    const matchesSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">All Incidents</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search incidents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-panel border border-border rounded-md py-1.5 pl-9 pr-8 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all shadow-sm" 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-panel border border-border rounded-md py-1.5 pl-3 pr-8 text-sm text-text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all shadow-sm cursor-pointer font-medium"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="bg-panel border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
         {filteredIncidents.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 animate-fade-in-down">
             <ShieldAlert className="w-12 h-12 text-text-tertiary mb-4 opacity-50" />
             <h3 className="text-lg font-medium text-text-primary mb-1">No matching incidents</h3>
             <p className="text-sm text-text-secondary mb-4">Try adjusting your filters or search term.</p>
             {(searchTerm || severityFilter !== 'All') && (
               <button 
                 onClick={() => { setSearchTerm(''); setSeverityFilter('All'); }}
                 className="text-sm font-medium text-accent-blue hover:underline"
               >
                 Clear all filters
               </button>
             )}
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left whitespace-nowrap">
               <thead className="text-xs text-text-tertiary uppercase bg-background border-b border-border">
                 <tr>
                   <th className="px-6 py-4 font-medium">Incident ID</th>
                   <th className="px-6 py-4 font-medium">Severity</th>
                   <th className="px-6 py-4 font-medium">Attack Pattern</th>
                   <th className="px-6 py-4 font-medium">Confidence</th>
                   <th className="px-6 py-4 font-medium">Status</th>
                   <th className="px-6 py-4 font-medium">Time Window</th>
                   <th className="px-6 py-4 font-medium text-right">Events</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {filteredIncidents.map((incident) => (
                   <tr key={incident.id} className="hover:bg-background/80 transition-colors group cursor-pointer" onClick={() => navigate(`/incidents/${incident.id}`)}>
                     <td className="px-6 py-4">
                       <Link to={`/incidents/${incident.id}`} className="font-bold text-text-primary group-hover:text-accent-blue transition-colors relative z-10" onClick={(e) => e.stopPropagation()}>
                         {incident.id}
                       </Link>
                     </td>
                     <td className="px-6 py-4">
                       <SeverityBadge severity={incident.severity} />
                     </td>
                     <td className="px-6 py-4 text-text-primary font-medium">{getIncidentLabel(incident.template_name)}</td>
                     <td className="px-6 py-4">
                        <span className="text-xs font-medium text-text-secondary bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {Math.round(incident.confidence * 100)}%
                        </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 text-accent-orange text-sm font-medium`}>
                         <span className={`w-1.5 h-1.5 rounded-full bg-accent-orange`}></span>
                         Open
                       </span>
                     </td>
                     <td className="px-6 py-4 text-text-secondary text-xs">
                        {format(new Date(incident.start_time), 'MMM d, HH:mm')} → {format(new Date(incident.end_time), 'HH:mm')}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono bg-border text-text-secondary">
                         {incident.matched_events.length}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
         {mockIncidents.length > 0 && (
           <div className="border-t border-border p-4 flex items-center justify-between text-sm text-text-secondary bg-background/30">
             <div>Showing 1 to {mockIncidents.length} of {mockIncidents.length} entries</div>
             <div className="flex gap-1">
               <button className="p-1 rounded hover:bg-border transition-colors"><ChevronLeft className="w-5 h-5" /></button>
               <button className="p-1 rounded hover:bg-border transition-colors"><ChevronRight className="w-5 h-5" /></button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default IncidentsList;
