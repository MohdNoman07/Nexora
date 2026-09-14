import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import WaveImg from './../assets/Wave.png';

/**
 * AppLayout — Fixed sidebar + fixed topbar, window scrolls naturally.
 * This is required for Lenis root-mode smooth scroll to work.
 * ReactLenis root targets window.scrollY, so the window must be the scroller.
 */
const AppLayout: React.FC = () => {
  return (
    <div className="antialiased text-slate-800">

      {/* ── Sidebar (fixed) ── */}
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] flex flex-col justify-between bg-white/70 backdrop-blur-2xl border-r border-slate-200/60 z-40 select-none overflow-hidden">
        
        {/* Wave ambient background — multiply blend makes it feel like part of the wall */}
        <div className="absolute bottom-0 left-0 w-full h-[380px] pointer-events-none select-none z-0" aria-hidden="true">
          <img
            src={WaveImg}
            alt=""
            className="w-full h-full object-cover object-bottom"
            style={{
              opacity: 0.13,
              mixBlendMode: 'multiply',
              filter: 'saturate(0.6) brightness(1.1)',
            }}
          />
        </div>

        {/* Content above the wave */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Logo */}
          <div className="px-5 pt-6 pb-2">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-7 w-7 rounded-lg bg-slate-950 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-[13px] font-serif tracking-tight">N</span>
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.2em] text-slate-900 uppercase">N E X O R A</div>
                <div className="text-[7.5px] tracking-[0.16em] text-slate-400 font-semibold uppercase">See. Connect. Prevent.</div>
              </div>
            </div>

            <nav className="space-y-0.5">
              {[
                { to: '/dashboard',      label: 'Overview',       icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
                { to: '/live',           label: 'Live Events',    icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
                { to: '/infrastructure', label: 'Infrastructure', icon: 'M2 3h20v7H2z M2 14h20v7H2z M6 6v.01 M6 17v.01' },
                { to: '/incidents',      label: 'Incidents',      icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01' },
                { to: '/correlation',    label: 'Correlation',    icon: 'M18 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.59 13.51l6.83 3.98 M15.41 6.51l-6.82 3.98' },
                { to: '/analytics',      label: 'Analytics',      icon: 'M18 20V10 M12 20V4 M6 20v-6' },
              ].map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <svg className="w-[15px] h-[15px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d={icon} />
                      </svg>
                      <span>{label}</span>
                      {label === 'Incidents' && (
                        <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                      )}
                      {label === 'Live Events' && (
                        <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-emerald-400'} animate-pulse`}></span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Bottom — Settings + tagline */}
          <div className="px-5 pb-6 space-y-4 pt-8">
            <button className="flex items-center gap-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors w-full">
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Settings
            </button>

            <div className="border-t border-slate-200/60 pt-3">
              <p className="font-serif text-[14px] leading-snug text-slate-800">
                Smarter Security<br/>
                <span className="italic text-slate-400 font-light">for a Safer Tomorrow.</span>
              </p>
              <div className="w-5 h-px bg-slate-300 mt-2"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Topbar (fixed) ── */}
      <header className="fixed top-0 left-[220px] right-0 h-14 border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-30">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search for IP, endpoint, user, or incident..."
            className="w-full pl-8 pr-14 py-1.5 text-[12px] bg-slate-100/80 border border-slate-200/60 rounded-full placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition text-slate-700"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2.5">
            <kbd className="text-[9px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shadow-sm">⌘ K</kbd>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            All systems operational
          </div>
          <button className="relative p-1.5 text-slate-400 hover:text-slate-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-1 ring-white"></span>
          </button>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-[10px] font-semibold flex items-center justify-center">SB</div>
            <span className="text-[12px] font-medium text-slate-700">Shiven Bansal</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </header>

      {/* ── Page content — offset for fixed sidebar+topbar, window scrolls ── */}
      <div className="ml-[220px] pt-14 min-h-screen">
        <Outlet />
      </div>

    </div>
  );
};

export default AppLayout;
