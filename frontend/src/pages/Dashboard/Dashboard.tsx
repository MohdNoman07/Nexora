import { ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { trafficChartData, attackTargetsData, mapData } from '../../data/uiMockData';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const Dashboard = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Threat Prevention</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md text-sm hover:border-text-tertiary transition-colors">
            All applications <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md text-sm hover:border-text-tertiary transition-colors">
            24 Jan - 27 Feb <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-xl p-5 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-text-primary">Normal and malicious traffic</h2>
            <div className="flex bg-background border border-border rounded-md p-1">
              <button className="px-3 py-1 text-xs rounded-sm text-text-secondary hover:text-text-primary transition-colors">Day</button>
              <button className="px-3 py-1 text-xs rounded-sm bg-panel border border-border text-text-primary shadow-sm">Monthly</button>
              <button className="px-3 py-1 text-xs rounded-sm text-text-secondary hover:text-text-primary transition-colors">Yearly</button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs mb-6">
             <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-transparent border-2 border-accent-red"></span> Incidents</div>
             <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-transparent border-2 border-accent-blue"></span> Requests</div>
             <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-transparent border-2 border-accent-orange"></span> Hits</div>
          </div>
          <div className="flex-1 min-h-0 relative -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#2a2a2a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="hits" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorHits)" />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} fill="none" />
                <Area type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} fillOpacity={0} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="bg-panel border border-border rounded-xl p-5 flex flex-col h-[400px]">
          <h2 className="font-semibold text-lg text-text-primary mb-4">Summary for a period</h2>
          <div className="flex-1 flex flex-col gap-2 justify-between">
             <KPICard title="Incidents" value="10" change="25.6%" trend="down" color="red" />
             <KPICard title="Hit blocked" value="5.38M" change="46.1%" trend="up" color="green" />
             <KPICard title="Hits" value="8M" change="15.1%" trend="up" color="orange" />
             <KPICard title="Requests" value="16.5M" change="" trend="" color="blue" />
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Attack Sources */}
         <div className="bg-panel border border-border rounded-xl p-5 h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-text-primary">Attack sources</h2>
              <div className="flex bg-background border border-border rounded-md p-1">
                <button className="px-3 py-1 text-xs rounded-sm bg-panel border border-border text-text-primary shadow-sm">Locations</button>
                <button className="px-3 py-1 text-xs rounded-sm text-text-secondary hover:text-text-primary transition-colors">Types</button>
              </div>
            </div>
            <div className="flex-1 bg-background/50 rounded-lg overflow-hidden relative">
              <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1a1a1a"
                        stroke="#2a2a2a"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#2a2a2a", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                {mapData.map(({ id, coordinates, attacks }) => (
                  <Marker key={id} coordinates={coordinates as [number, number]}>
                    <circle r={ attacks > 0 ? 6 : 3 } fill="#f97316" className="animate-pulse opacity-80" />
                    <circle r={ attacks > 0 ? 12 : 0 } fill="#f97316" opacity={0.2} />
                  </Marker>
                ))}
              </ComposableMap>
              
              {/* Overlay tooltip mockup */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-panel/90 backdrop-blur border border-border p-3 rounded-lg shadow-xl flex flex-col gap-2 pointer-events-none">
                 <div className="flex justify-between items-center gap-4">
                   <div className="flex items-center gap-2">
                     <span>🇺🇸</span> <span className="text-sm font-medium">USA</span>
                   </div>
                   <div className="text-accent-green text-xs flex items-center">↗</div>
                 </div>
                 <div className="flex justify-between items-end gap-6 mt-1">
                    <span className="text-xs text-text-secondary">3 attacks</span>
                    <span className="text-sm font-bold">4%</span>
                 </div>
                 <div className="w-full bg-border h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-accent-blue h-full w-[40%]"></div>
                 </div>
              </div>
            </div>
         </div>

         {/* Attack Targets */}
         <div className="bg-panel border border-border rounded-xl p-5 h-[450px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-text-primary">Attack targets</h2>
              <div className="flex bg-background border border-border rounded-md p-1">
                <button className="px-3 py-1 text-xs rounded-sm bg-panel border border-border text-text-primary shadow-sm">Domains</button>
                <button className="px-3 py-1 text-xs rounded-sm text-text-secondary hover:text-text-primary transition-colors">Applications</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto pr-2">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-tertiary uppercase sticky top-0 bg-panel z-10">
                  <tr>
                    <th className="py-3 font-medium">Domains</th>
                    <th className="py-3 font-medium text-right">Incidents</th>
                    <th className="py-3 font-medium text-right">Hits</th>
                    <th className="py-3 font-medium text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attackTargetsData.map((row, i) => (
                    <tr key={i} className="hover:bg-background/50 transition-colors group">
                      <td className="py-3 text-text-secondary group-hover:text-text-primary transition-colors">{row.domain}</td>
                      <td className="py-3 text-right">
                        {row.incidents ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] rounded-full border border-accent-red text-accent-red bg-accent-red/10">
                            {row.incidents}
                          </span>
                        ) : (
                          <span className="text-text-tertiary">--</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-text-primary">{row.hits}</td>
                      <td className={`py-3 text-right ${row.trendColor === 'red' ? 'text-accent-red' : 'text-accent-green'}`}>
                        {row.trend}
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

const KPICard = ({ title, value, change, trend, color }: { title: string, value: string, change: string, trend: string, color: string }) => {
  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-background/50 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-border">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background border border-border`}>
          <span className={`w-3 h-3 rounded-full ${
            color === 'red' ? 'bg-accent-red/20 border border-accent-red' :
            color === 'green' ? 'bg-accent-green/20 border border-accent-green' :
            color === 'orange' ? 'bg-accent-orange/20 border border-accent-orange' :
            'bg-accent-blue/20 border border-accent-blue'
          }`}></span>
        </div>
        <div>
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-text-primary">{value}</span>
            {change && (
              <span className={`text-xs mb-1 font-medium ${trend === 'down' ? 'text-text-secondary' : color === 'red' ? 'text-accent-red' : 'text-text-secondary'}`}>
                {change} {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="text-sm text-text-secondary">{title}</div>
        </div>
      </div>
      <div className="text-text-tertiary group-hover:text-text-primary transition-colors">→</div>
    </div>
  );
}

export default Dashboard;
