import { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, X } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import type { NexoraEvent } from '../../types/nexora';
import { format } from 'date-fns';

const LiveActivity = () => {
  const { events: simEvents } = useSimulation();

  // Ref so the interval always reads the current event pool without restarting
  const simEventsRef = useRef(simEvents);
  useEffect(() => { simEventsRef.current = simEvents; }, [simEvents]);

  // Local display state — initialized from global pool, managed by interval + injection watcher
  const [events, setEvents] = useState<NexoraEvent[]>(() => [...simEvents].reverse().slice(0, 8));
  const [isLive, setIsLive] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NexoraEvent | null>(null);

  // Watch for newly injected events (appended to global state during injection)
  const prevSimLengthRef = useRef(simEvents.length);
  useEffect(() => {
    const current = simEvents.length;
    if (current > prevSimLengthRef.current) {
      const newEvents = simEvents.slice(prevSimLengthRef.current);
      // Prepend each injected event to the top of the live feed
      setEvents(prev => [...[...newEvents].reverse(), ...prev].slice(0, 50));
      prevSimLengthRef.current = current;
    }
  }, [simEvents]);

  // Existing interval simulation — cycles through global pool to produce background chatter
  // Entirely independent of injection. Uses ref so pool updates don't restart the interval.
  useEffect(() => {
    if (!isLive) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      setEvents(prev => {
        const pool = simEventsRef.current;
        const nextEvent = {
          ...pool[currentIndex % pool.length],
          id: `evt-sim-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        currentIndex = (currentIndex + 1) % pool.length;
        return [nextEvent, ...prev].slice(0, 50);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Live Event Stream</h1>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isLive ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
             <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`}></span>
             {isLive ? 'LIVE' : 'PAUSED'}
          </span>
          <span className="text-xs font-medium text-text-tertiary bg-border px-2 py-1 rounded">Simulation Mode</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsLive(!isLive)}
            className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md text-sm hover:border-text-tertiary transition-colors shadow-sm font-medium"
          >
             {isLive ? <Square className="w-4 h-4 text-accent-orange" /> : <Play className="w-4 h-4 text-accent-green" />} 
             {isLive ? 'Pause Stream' : 'Resume Stream'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className={`bg-panel border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-all ${selectedEvent ? 'w-full lg:w-2/3' : 'w-full'}`}>
           <div className={`p-4 border-b border-border flex items-center justify-between ${isLive ? 'bg-background/50' : 'bg-slate-100 opacity-70'}`}>
              <div className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Activity className={`w-4 h-4 ${isLive ? 'text-accent-blue' : 'text-slate-400'}`} /> {isLive ? 'Real-Time Correlation Feed' : 'Feed Paused'}
              </div>
              <div className="text-xs text-text-tertiary font-mono">
                Displaying {events.length} events
              </div>
           </div>
           <div className={`overflow-x-auto ${!isLive ? 'opacity-80' : ''}`}>
             <table className="w-full text-sm text-left whitespace-nowrap">
               <thead className="text-xs text-text-tertiary uppercase bg-background border-b border-border">
                 <tr>
                   <th className="px-6 py-4 font-medium">Time</th>
                   <th className="px-6 py-4 font-medium">Event Type</th>
                   <th className="px-6 py-4 font-medium">Target / Action</th>
                   <th className="px-6 py-4 font-medium">Source IP</th>
                   <th className="px-6 py-4 font-medium text-right">Anomaly Score</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {events.map((ev) => {
                   const metadataStr = ev.metadata ? Object.entries(ev.metadata).map(([k,v]) => `${k}:${v}`).join(' ') : '-';
                   const isSelected = selectedEvent?.id === ev.id;
                   
                   return (
                   <tr key={ev.id} onClick={() => setSelectedEvent(ev)} className={`cursor-pointer transition-colors group animate-fade-in-down ${isSelected ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : ev.attack_label ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-background/80'}`}>
                     <td className="px-6 py-4 font-mono text-xs text-text-secondary border-l-2 border-transparent">
                       {format(new Date(ev.timestamp), 'HH:mm:ss')}
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ev.attack_label ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                           {ev.event_type.replace(/_/g, ' ')}
                         </span>
                         {ev.attack_label && (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                             {ev.attack_label}
                           </span>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-xs font-mono text-text-secondary truncate max-w-[150px]" title={metadataStr}>
                       {metadataStr}
                     </td>
                     <td className="px-6 py-4 font-mono text-xs text-text-secondary">{ev.ip}</td>
                     <td className="px-6 py-4 text-right">
                       <span className={`font-mono text-xs font-medium px-2 py-1 rounded bg-slate-50 border ${ev.anomaly_score >= 0.8 ? 'text-accent-red border-red-200 bg-red-50' : ev.anomaly_score >= 0.5 ? 'text-accent-orange border-orange-200 bg-orange-50' : 'text-text-secondary border-slate-200'}`}>
                         {ev.anomaly_score.toFixed(2)}
                       </span>
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        </div>

        {selectedEvent && (
          <div className="bg-panel border border-border rounded-xl shadow-sm flex flex-col w-full lg:w-1/3 animate-fade-in-down sticky top-6">
             <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
               <div className="text-sm font-semibold text-text-primary">Event Details</div>
               <button onClick={() => setSelectedEvent(null)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded hover:bg-background">
                 <X className="w-4 h-4" />
               </button>
             </div>
             <div className="p-5 space-y-5 text-sm">
                <div>
                  <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">Event ID</div>
                  <div className="font-mono text-text-primary">{selectedEvent.id}</div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">Timestamp</div>
                  <div className="font-mono text-text-primary">{format(new Date(selectedEvent.timestamp), 'yyyy-MM-dd HH:mm:ss')}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">User</div>
                    <div className="font-medium text-text-primary">{selectedEvent.user}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">Source IP</div>
                    <div className="font-mono text-text-primary">{selectedEvent.ip}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">Session ID</div>
                  <div className="font-mono text-text-primary text-xs break-all bg-background border border-border p-2 rounded">{selectedEvent.session}</div>
                </div>
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                  <div>
                    <div className="text-xs text-text-tertiary uppercase font-bold tracking-wider mb-1">Metadata</div>
                    <div className="bg-background border border-border p-3 rounded font-mono text-xs text-text-primary space-y-1">
                      {Object.entries(selectedEvent.metadata).map(([k, v]) => (
                        <div key={k}><span className="text-text-tertiary">{k}:</span> {v as string}</div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveActivity;
