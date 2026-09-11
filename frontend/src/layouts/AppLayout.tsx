import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl flex flex-col justify-between z-30 shrink-0 select-none">
        <div className="p-6">
          {/* Nexora Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-serif font-bold text-xl tracking-wider shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-widest text-slate-900 text-sm uppercase">
                <span>N E X O R A</span>
              </div>
              <span className="text-[9px] tracking-[0.22em] text-slate-400 font-semibold uppercase block">
                See. Connect. Prevent.
              </span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="space-y-1.5">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Overview
            </NavLink>
            <NavLink to="/live" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              Live Events
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </NavLink>
            <NavLink to="/infrastructure" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect height="8" rx="2" ry="2" width="20" x="2" y="2"></rect><rect height="8" rx="2" ry="2" width="20" x="2" y="14"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
              Infrastructure
            </NavLink>
            <NavLink to="/incidents" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
              Incidents
              <span className="ml-auto bg-rose-50 text-rose-600 border border-rose-200 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">3</span>
            </NavLink>
            <NavLink to="/correlation" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
              Correlation
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>
              Analytics
            </NavLink>
          </nav>
        </div>
        
        {/* Sidebar Bottom: Settings & Editorial Motif */}
        <div className="p-6 border-t border-slate-200/50 space-y-5">
          <button className="flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors w-full text-left">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            Settings
          </button>
          
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-serif text-lg leading-tight text-slate-800">
              Smarter Security<br/>
              <span className="italic text-slate-500 font-light">for a Safer Tomorrow.</span>
            </h3>
            <div className="w-6 h-[1.5px] bg-slate-400 mt-2.5"></div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-200/60 bg-white/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-20">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
            </span>
            <input className="w-full pl-9 pr-14 py-1.5 bg-slate-100/70 border border-slate-200/60 rounded-full text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition" placeholder="Search for IP, endpoint, user, or incident..." type="text"/>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-sm">⌘ K</kbd>
            </span>
          </div>

          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
            <button className="relative p-1.5 text-slate-400 hover:text-slate-700 transition" title="View alerts">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-medium text-xs flex items-center justify-center tracking-tight shadow-sm">
                SB
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 group-hover:text-slate-950">
                  Shiven Bansal
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6 noise-overlay relative z-10 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
