import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Radar,
  Activity,
  AlertTriangle,
  ChevronDown,
  Zap,
  Wifi,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import type { AttackScenario } from '../context/SimulationContext';

const SCENARIOS: { label: string; type: AttackScenario }[] = [
  { label: 'Credential Stuffing', type: 'credential_stuffing' },
  { label: 'Port Scan', type: 'port_scan' },
  { label: 'Data Exfiltration', type: 'exfiltration' },
];

const NAV_ITEMS = [
  { to: '/dashboard', icon: Radar, label: 'Overview' },
  { to: '/live', icon: Activity, label: 'Live Feed' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
];

// Icon rail, not a labelled sidebar — this is the whole nav on every screen
// size, so there is no separate mobile layout to maintain.
const Rail = () => {
  return (
    <aside className="w-16 shrink-0 h-screen bg-ink-1 border-r border-line flex flex-col items-center py-4">
      <div
        className="w-9 h-9 rounded-sm flex items-center justify-center mb-6 border"
        style={{ borderColor: 'var(--color-signal-dim)', backgroundColor: 'rgba(51,214,192,0.1)' }}
      >
        <Radar className="w-[18px] h-[18px]" style={{ color: 'var(--color-signal)' }} />
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `group relative w-10 h-10 rounded-sm flex items-center justify-center transition-colors ${
                isActive ? 'bg-ink-2 text-text-primary' : 'text-text-tertiary hover:text-text-secondary hover:bg-ink-2/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full" style={{ backgroundColor: 'var(--color-signal)' }} />
                )}
                <Icon className="w-[18px] h-[18px]" />
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap text-xs font-mono bg-ink-2 border border-line px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 pt-3 border-t border-line-soft w-full">
        <span className="w-2 h-2 rounded-full animate-pulse-live" style={{ backgroundColor: 'var(--color-signal)' }} title="Monitoring active" />
      </div>
    </aside>
  );
};

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

const InjectAttackControl = () => {
  const { injectAttack, injectionStatus } = useSimulation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDisabled = injectionStatus === 'injecting';
  const label =
    injectionStatus === 'injecting' ? 'INJECTING…' : injectionStatus === 'done' ? 'INJECTED' : 'INJECT ATTACK';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { if (!isDisabled && injectionStatus === 'idle') setOpen(o => !o); }}
        disabled={isDisabled}
        className={`inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wide px-3 py-1.5 rounded-sm border transition-colors ${
          injectionStatus === 'done'
            ? 'border-[var(--color-signal-dim)] text-[var(--color-signal)]'
            : isDisabled
            ? 'border-line text-text-tertiary cursor-not-allowed'
            : 'border-line text-text-secondary hover:text-text-primary hover:border-text-tertiary'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        {label}
        {injectionStatus === 'idle' && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && injectionStatus === 'idle' && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-ink-2 border border-line rounded-sm z-50 py-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-mono text-text-tertiary tracking-wide">SIMULATION SCENARIOS</div>
          {SCENARIOS.map(({ label, type }) => (
            <button
              key={type}
              onClick={() => { setOpen(false); injectAttack(type); }}
              className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-ink-1 hover:text-text-primary transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="px-3 py-2 mt-1 border-t border-line-soft text-[10px] text-text-tertiary">
            Simulated injection only — no real system action
          </div>
        </div>
      )}
    </div>
  );
};

// Console status bar: reads like an instrument readout, not an app header —
// live clock, throughput, connection state. Carries the page title too.
const StatusBar = () => {
  const { events } = useSimulation();
  const now = useLiveClock();

  return (
    <header className="h-12 border-b border-line bg-ink-1 flex items-center justify-between px-5 shrink-0 text-xs font-mono">
      <div className="flex items-center gap-5 text-text-tertiary">
        <span className="text-text-secondary font-semibold tracking-wide">NEXORA</span>
        <span className="hidden sm:inline">EVENTS&nbsp;<span className="readout text-text-primary">{events.length}</span></span>
        <span className="hidden md:inline-flex items-center gap-1.5">
          <Wifi className="w-3 h-3" style={{ color: 'var(--color-signal)' }} />
          <span style={{ color: 'var(--color-signal)' }}>SIMULATION</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <InjectAttackControl />
        <span className="readout text-text-secondary hidden sm:inline">
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </header>
  );
};

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-0 text-text-primary font-sans">
      <Rail />
      <div className="flex flex-col flex-1 min-w-0">
        <StatusBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
