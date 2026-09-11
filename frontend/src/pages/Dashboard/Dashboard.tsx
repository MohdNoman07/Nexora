import React from 'react';
import { CorrelationGraph } from '../../components/CorrelationGraph';

const Dashboard: React.FC = () => {
  return (
    <>
      <section aria-label="Hero Overview" className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-indigo-600 block mb-1">
            REAL-TIME THREAT INTELLIGENCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-slate-950 tracking-tight font-normal leading-[1.1]">
            See what others miss.
          </h1>
          <p className="text-sm text-slate-500 font-light mt-1.5">
            Uncover hidden connections. Stop attacks before they escalate.
          </p>

          <div className="flex items-center gap-8 mt-5">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">1.24M</div>
              <div className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                Events <span className="text-emerald-600 font-medium text-[11px] font-mono">↑ 12%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200/80"></div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">14</div>
              <div className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                Anomalies <span className="text-emerald-600 font-medium text-[11px] font-mono">↑ 6%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200/80"></div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-slate-950 font-sans">3</div>
              <div className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                Active Threats <span className="text-rose-600 font-medium text-[11px] font-mono">↑ 200%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md bg-white/50 backdrop-blur-sm border border-slate-200/60 p-5 rounded-2xl" style={{ boxShadow: 'var(--shadow-glass)' }}>
          <p className="font-serif italic text-lg text-slate-800 leading-snug">
            “It’s not just about detecting threats, but understanding how they connect.”
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-5 h-[1.5px] bg-slate-400"></div>
            <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-500 uppercase">
              Intelligence Creates Clarity
            </span>
          </div>
        </div>
      </section>

      <CorrelationGraph />

      <section aria-label="Event Telemetry and Perspective" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between" style={{ boxShadow: 'var(--shadow-glass)' }}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Live Event Stream</h3>
                <span className="text-xs font-mono text-slate-400">Real-time Correlation Feed</span>
              </div>
              <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition">
                View All
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>
            
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100/80 text-[11px] uppercase tracking-wider">
                    <th className="py-2 pl-1">Timestamp</th>
                    <th className="py-2">Event Classification</th>
                    <th className="py-2">Verb / Target</th>
                    <th className="py-2">Source IP</th>
                    <th className="py-2 pr-1">Correlation Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-mono text-[11px]">
                  <tr className="hover:bg-rose-50/40 transition cursor-pointer group">
                    <td className="py-2.5 pl-1 text-slate-500">22:41:16</td>
                    <td className="py-2.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Threat Identified
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700"><span className="font-semibold text-slate-900 font-mono">POST</span> /api/users/search</td>
                    <td className="py-2.5 text-slate-600">185.42.91.8</td>
                    <td className="py-2.5 pr-1 text-rose-600 font-sans font-medium">SQL Injection pattern matched</td>
                  </tr>
                  <tr className="hover:bg-violet-50/40 transition cursor-pointer group">
                    <td className="py-2.5 pl-1 text-slate-500">22:41:14</td>
                    <td className="py-2.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-violet-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Correlation Created
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600 font-sans">Chain AC-014</td>
                    <td className="py-2.5 text-slate-400">—</td>
                    <td className="py-2.5 pr-1 text-slate-600 font-sans">4 related telemetry events linked</td>
                  </tr>
                  <tr className="hover:bg-amber-50/40 transition cursor-pointer group">
                    <td className="py-2.5 pl-1 text-slate-500">22:41:12</td>
                    <td className="py-2.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Anomaly Detected
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700"><span className="font-semibold text-slate-900 font-mono">GET</span> /api/users</td>
                    <td className="py-2.5 text-slate-600">192.168.1.45</td>
                    <td className="py-2.5 pr-1 text-slate-600 font-sans">Unusual query parameter token</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 transition cursor-pointer group">
                    <td className="py-2.5 pl-1 text-slate-500">22:41:10</td>
                    <td className="py-2.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Suspicious Request
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700"><span className="font-semibold text-slate-900 font-mono">POST</span> /api/login</td>
                    <td className="py-2.5 text-slate-600">185.42.91.8</td>
                    <td className="py-2.5 pr-1 text-slate-500 font-sans">401 — Failed credential replay</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition cursor-pointer group">
                    <td className="py-2.5 pl-1 text-slate-400">22:41:08</td>
                    <td className="py-2.5 font-sans">
                      <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Normal Event
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500"><span className="text-slate-600 font-mono">GET</span> /</td>
                    <td className="py-2.5 text-slate-500">192.168.1.10</td>
                    <td className="py-2.5 pr-1 text-slate-400 font-sans">200 — OK Heartbeat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white min-h-[200px] flex flex-col justify-end p-6 group shadow-md">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-800/40 mix-blend-multiply z-10"></div>
          <svg className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700 ease-out" fill="none" viewBox="0 0 400 300">
            <path d="M0 300 L120 180 L200 240 L300 120 L400 260 L400 300 Z" fill="#64748b"></path>
            <path d="M-50 300 L100 220 L180 260 L280 170 L450 300 Z" fill="#475569" fillOpacity="0.8"></path>
            <circle cx="320" cy="90" fill="#94a3b8" fillOpacity="0.2" r="40"></circle>
          </svg>
          
          <div className="relative z-20">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400 block mb-1">
              PHILOSOPHY
            </span>
            <h4 className="font-serif text-2xl font-light leading-snug tracking-tight text-white">
              Turning Data into <br/><span className="italic font-normal text-indigo-300">Security.</span>
            </h4>
            <div className="w-8 h-[1.5px] bg-indigo-400 my-3"></div>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              When attack telemetry harmonizes into structured graphs, defense shifts from reactive triage to sovereign intuition.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
