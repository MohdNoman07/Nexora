import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Info, Filter, Play, Square } from 'lucide-react';
import { mockEvents } from '../../data/mockData';

const getSeverityIcon = (severity: number) => {
  if (severity >= 0.8) return <ShieldAlert className="w-4 h-4 text-accent-red" />;
  if (severity >= 0.5) return <AlertTriangle className="w-4 h-4 text-accent-orange" />;
  return <Info className="w-4 h-4 text-accent-blue" />;
};

const LiveActivity = () => {
  const [events, setEvents] = useState(mockEvents.slice(0, 5));
  const [isLive, setIsLive] = useState(true);

  // Simulate incoming events
  useEffect(() => {
    if (!isLive) return;
    
    let currentIndex = 5;
    const interval = setInterval(() => {
      if (currentIndex < mockEvents.length) {
        setEvents(prev => [mockEvents[currentIndex], ...prev]);
        currentIndex++;
      } else {
        currentIndex = 0; // loop for demo
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Live Activity</h1>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isLive ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : 'bg-border text-text-secondary border-border'
          }`}>
             <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent-red animate-pulse' : 'bg-text-tertiary'}`}></span>
             {isLive ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md text-sm hover:border-text-tertiary transition-colors"
          >
             {isLive ? <Square className="w-4 h-4 text-accent-orange" /> : <Play className="w-4 h-4 text-accent-green" />} 
             {isLive ? 'Pause Stream' : 'Resume Stream'}
          </button>
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
                 <th className="px-6 py-4 font-medium">Time</th>
                 <th className="px-6 py-4 font-medium">Severity</th>
                 <th className="px-6 py-4 font-medium">Event Type</th>
                 <th className="px-6 py-4 font-medium">User</th>
                 <th className="px-6 py-4 font-medium">Source IP</th>
                 <th className="px-6 py-4 font-medium">Classification</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {events.map((ev, index) => (
                 <tr key={`${ev.id}-${index}`} className="hover:bg-background/50 transition-colors group animate-fade-in-down">
                   <td className="px-6 py-4 font-mono text-xs text-text-secondary">
                     {new Date(ev.timestamp).toLocaleTimeString()}
                   </td>
                   <td className="px-6 py-4">
                     <span className="flex items-center gap-2">
                       {getSeverityIcon(ev.severity)}
                       <span className={`text-xs font-mono ${ev.severity >= 0.8 ? 'text-accent-red' : ev.severity >= 0.5 ? 'text-accent-orange' : 'text-text-secondary'}`}>
                         {ev.severity.toFixed(2)}
                       </span>
                     </span>
                   </td>
                   <td className="px-6 py-4 text-text-primary font-medium">{ev.event_type}</td>
                   <td className="px-6 py-4 text-text-secondary">{ev.user}</td>
                   <td className="px-6 py-4 font-mono text-xs text-text-secondary">{ev.ip}</td>
                   <td className="px-6 py-4">
                     {ev.attack_label ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-accent-red/20 text-accent-red">
                         {ev.attack_label}
                       </span>
                     ) : (
                       <span className="text-text-tertiary text-xs">-</span>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default LiveActivity;
