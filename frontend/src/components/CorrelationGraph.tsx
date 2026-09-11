import React, { useState } from 'react';

const NODE_DATA: Record<string, any> = {
  threat: {
    badge: "POTENTIAL THREAT",
    badgeClass: "bg-rose-50 text-rose-600 border-rose-200",
    icon: "⚡",
    title: "Possible SQL Injection",
    subtitle: "/api/users/search",
    confidence: "91%",
    events: "4",
    chain: "AC-014",
    firstSeen: "2 min ago"
  },
  ip: {
    badge: "ADVERSARY SOURCE",
    badgeClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
    icon: "🌐",
    title: "External Ingress IP",
    subtitle: "185.42.91.8 (AS204915)",
    confidence: "98%",
    events: "142",
    chain: "AC-014 / Recon",
    firstSeen: "48 min ago"
  },
  account: {
    badge: "COMPROMISED IDENTITY",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "👤",
    title: "Elevated Admin Identity",
    subtitle: "admin@nexora.internal",
    confidence: "87%",
    events: "9",
    chain: "AC-014 / Privilege Escalation",
    firstSeen: "14 min ago"
  },
  endpoint: {
    badge: "EXPLOITED ENDPOINT",
    badgeClass: "bg-purple-50 text-purple-600 border-purple-200",
    icon: "🔌",
    title: "API Gateway Target",
    subtitle: "POST /api/users/search",
    confidence: "95%",
    events: "12",
    chain: "AC-014",
    firstSeen: "5 min ago"
  },
  database: {
    badge: "CRITICAL ASSET AT RISK",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-300",
    icon: "🗄️",
    title: "Customer PII Database (db-1)",
    subtitle: "PostgreSQL Production Cluster",
    confidence: "99%",
    events: "3 (Blocked Reads)",
    chain: "AC-014 / Exfiltration Risk",
    firstSeen: "Just now"
  }
};

export const CorrelationGraph: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('threat');
  const [activeView, setActiveView] = useState('all');

  const data = NODE_DATA[activeNode];

  return (
    <section aria-label="Visual Threat Correlation Centerpiece" className="relative rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-6 overflow-hidden" style={{ boxShadow: 'var(--shadow-glass)' }}>
      {/* Graph Filter Layer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 relative z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Views:</span>
          {['all', 'threat', 'identities'].map(v => (
            <button 
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm transition ${activeView === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {v === 'all' ? 'All Correlated Entities' : v === 'threat' ? 'Active Attack Vector (AC-014)' : 'Identity & Credential Path'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Threat Incursion</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Identity</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Network/IP</span>
        </div>
      </div>

      {/* SVG Topology & Interactive Graph Canvas */}
      <div className="relative w-full h-[470px] flex items-center justify-center overflow-hidden">
        
        {/* Translucent Watermark / Topology Grid */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none opacity-25">
          <svg className="w-96 h-96 -translate-x-12 stroke-slate-300" fill="none" strokeWidth="0.5" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" strokeDasharray="2 2"></circle>
            <circle cx="50" cy="50" r="32"></circle>
            <circle cx="50" cy="50" r="18" strokeDasharray="1 3"></circle>
            <ellipse cx="50" cy="50" rx="45" ry="16"></ellipse>
            <ellipse cx="50" cy="50" rx="16" ry="45"></ellipse>
          </svg>
          <span className="absolute bottom-6 left-6 font-serif italic text-sm text-slate-400">
            A clearer view of a safer world.
          </span>
        </div>

        {/* Main SVG Attack Flow Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 1000 500">
          <defs>
            <linearGradient id="grad-threat-flow" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6"></stop>
              <stop offset="50%" stopColor="#ef4444"></stop>
              <stop offset="100%" stopColor="#f43f5e"></stop>
            </linearGradient>
          </defs>
          
          <path d="M 680,80 L 510,120" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1.2"></path>
          <path d="M 680,80 L 660,160" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 660,160 L 590,265" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 430,200 L 460,250" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 400,330 L 460,250" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 760,350 L 665,300" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 665,300 L 590,265" stroke="#cbd5e1" strokeWidth="1.2"></path>
          <path d="M 460,250 L 510,120" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="1.2"></path>

          <path className="attack-path-active" d="M 500,135 Q 520,185 540,205" fill="none" stroke="url(#grad-threat-flow)" strokeWidth="3"></path>
          <path className="attack-path-active" d="M 470,255 C 500,245 520,230 535,215" fill="none" stroke="#ef4444" strokeWidth="2.5"></path>
          <path className="attack-path-active" d="M 560,225 Q 580,240 595,260" fill="none" stroke="#ef4444" strokeWidth="3"></path>
          <path className="attack-path-active" d="M 605,285 Q 630,320 665,315" fill="none" stroke="url(#grad-threat-flow)" strokeWidth="3.5"></path>
        </svg>

        {/* Nodes */}
        <div className="absolute top-[80px] left-[460px] flex items-center gap-3 cursor-pointer group node-transition" onClick={() => setActiveNode('ip')}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform" style={{ boxShadow: 'var(--shadow-glow-blue)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">External IP</div>
            <div className="font-mono text-xs font-semibold text-slate-800">185.42.91.8</div>
          </div>
        </div>

        <div className="absolute top-[215px] left-[380px] flex items-center gap-3 cursor-pointer group node-transition" onClick={() => setActiveNode('account')}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center text-white group-hover:scale-110 transition-transform" style={{ boxShadow: 'var(--shadow-glow-blue)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">admin</div>
            <div className="text-[10px] text-slate-400 font-medium">User Account (Elevated)</div>
          </div>
        </div>

        <div className="absolute top-[170px] left-[515px] flex items-center gap-3 cursor-pointer group z-20 node-transition" onClick={() => setActiveNode('threat')}>
          <div className="relative">
            <div className="absolute -inset-3 bg-red-500/25 rounded-full blur-md animate-pulse-glow"></div>
            <div className="w-14 h-14 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white group-hover:scale-110 transition-transform relative z-10" style={{ boxShadow: 'var(--shadow-glow-red)' }}>
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-200 shadow-sm">
            <div className="text-xs font-bold text-rose-700 font-mono">/api/login</div>
            <div className="text-[10px] text-rose-600 font-medium">47 failed attempts</div>
          </div>
        </div>

        <div className="absolute top-[230px] left-[565px] flex items-center gap-3 cursor-pointer group node-transition" onClick={() => setActiveNode('endpoint')}>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-violet-600 border border-violet-400 flex items-center justify-center text-white group-hover:scale-110 transition-transform" style={{ boxShadow: 'var(--shadow-glow-purple)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17l6-6-6-6M12 19h8"></path></svg>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 font-mono">/api/users</div>
            <div className="text-[10px] text-slate-400">Suspicious SQL query</div>
          </div>
        </div>

        <div className="absolute top-[280px] left-[640px] flex items-center gap-3 cursor-pointer group node-transition" onClick={() => setActiveNode('database')}>
          <div className="relative">
            <div className="absolute -inset-2 bg-rose-500/20 rounded-full blur-sm"></div>
            <div className="w-12 h-12 rounded-2xl bg-rose-700 border border-rose-400 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform relative z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-mono">db-1</div>
            <div className="text-[10px] font-semibold text-rose-600">Sensitive Data Exfil Risk</div>
          </div>
        </div>

        {/* Peripheral context */}
        <div className="absolute top-[40px] right-[240px] flex items-center gap-2 opacity-50 text-slate-400 text-xs">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
          <span>Firewall</span>
        </div>
        <div className="absolute top-[130px] right-[180px] flex items-center gap-2 opacity-50 text-slate-400 text-xs">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="12" rx="2" width="18" x="3" y="4"></rect><line x1="2" x2="22" y1="20" y2="20"></line></svg></div>
          <span>Workstation</span>
        </div>
        <div className="absolute bottom-[80px] right-[150px] flex items-center gap-2 opacity-50 text-slate-400 text-xs">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg></div>
          <span>Cloud VPC</span>
        </div>
        <div className="absolute bottom-[70px] left-[350px] flex items-center gap-2 opacity-50 text-slate-400 text-xs">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg></div>
          <span>API Gateway</span>
        </div>

        {/* Floating Threat Inspector Card */}
        {data && (
          <div className="absolute top-8 right-6 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-2xl transition-all duration-300 z-30 ring-2 ring-transparent">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${data.badgeClass}`}>
                {activeNode === 'threat' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                {data.badge}
              </span>
              <button className="text-slate-400 hover:text-slate-600 text-xs" title="Expand View">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" x2="14" y1="3" y2="10"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>
              </button>
            </div>
            
            <div className="mt-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                  {data.icon}
                </div>
                <h2 className="font-bold text-base text-slate-900 leading-tight">
                  {data.title}
                </h2>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-1 pl-8">
                {data.subtitle}
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>Confidence</span>
                <span className="font-bold font-mono text-rose-600">{data.confidence}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>Related events</span>
                <span className="font-mono text-slate-700 font-semibold">{data.events}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line></svg>Attack chain</span>
                <span className="font-mono text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">{data.chain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>First seen</span>
                <span className="font-mono text-slate-600">{data.firstSeen}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
              <button className="flex-1 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition">
                <span>Investigate Chain</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
              <button className="px-2.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition" title="Mitigate / Block">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"></line></svg>
              </button>
            </div>
          </div>
        )}

        {/* Stage Steps Indicators */}
        <div className="absolute right-6 bottom-4 flex flex-col gap-2 text-[10px] font-mono font-medium text-slate-400">
          <span className="hover:text-slate-800 transition cursor-pointer">01 DETECT</span>
          <span className="hover:text-slate-800 transition cursor-pointer text-indigo-600 font-bold">02 CORRELATE</span>
          <span className="hover:text-slate-800 transition cursor-pointer">03 PREVENT</span>
        </div>
      </div>
    </section>
  );
};
