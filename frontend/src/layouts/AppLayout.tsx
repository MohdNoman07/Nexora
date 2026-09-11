import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSimulation } from '../context/SimulationContext';
import type { AttackScenario } from '../context/SimulationContext';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const SCENARIOS: { label: string; type: AttackScenario }[] = [
  { label: 'Credential Stuffing', type: 'credential_stuffing' },
  { label: 'Port Scan',           type: 'port_scan' },
  { label: 'Data Exfiltration',   type: 'exfiltration' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-panel border-r border-border h-screen flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-5 flex items-center gap-3 mb-6 border-b border-border">
        <div className="w-8 h-8 rounded bg-text-primary flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-panel" />
        </div>
        <span className="text-xl font-bold text-text-primary tracking-tight">Nexora</span>
      </div>

      <nav className="flex-1 px-4 space-y-8">
        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-2">Monitoring</div>
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<Activity className="w-4 h-4" />} label="Dashboard" />
            <NavItem to="/live" icon={<Activity className="w-4 h-4" />} label="Live Activity" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-2">Incidents</div>
          <div className="space-y-1">
            <NavItem to="/incidents" icon={<AlertTriangle className="w-4 h-4" />} label="All Incidents" />
          </div>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-xs font-medium text-text-secondary">
             NX
           </div>
           <div className="text-sm">
             <div className="font-medium text-text-primary">SOC Analyst</div>
             <div className="text-xs text-text-tertiary">Active</div>
           </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all font-medium",
        isActive 
          ? "bg-accent-blue/10 text-accent-blue" 
          : "text-text-secondary hover:text-text-primary hover:bg-panel-hover"
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
};

const InjectAttackDropdown = () => {
  const { injectAttack, injectionStatus } = useSimulation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (type: AttackScenario) => {
    setOpen(false);
    injectAttack(type);
  };

  const isDisabled = injectionStatus === 'injecting';

  const buttonLabel =
    injectionStatus === 'injecting' ? 'Injecting...' :
    injectionStatus === 'done'      ? '✓ Injected' :
                                      'Inject Attack';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { if (!isDisabled && injectionStatus === 'idle') setOpen(o => !o); }}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors',
          injectionStatus === 'done'
            ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
            : isDisabled
            ? 'bg-background text-text-tertiary border-border cursor-not-allowed opacity-60'
            : 'bg-background text-text-secondary border-border hover:border-text-tertiary hover:text-text-primary'
        )}
      >
        <Zap className="w-3.5 h-3.5" />
        {buttonLabel}
        {injectionStatus === 'idle' && <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />}
      </button>

      {open && injectionStatus === 'idle' && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-panel border border-border rounded-md shadow-lg z-50 py-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
            Simulation Scenarios
          </div>
          {SCENARIOS.map(({ label, type }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="px-3 py-2 mt-1 border-t border-border">
            <span className="text-[10px] text-text-tertiary">
              Simulated injection only — no real system action
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const Topbar = () => {
  return (
    <header className="h-14 border-b border-border bg-panel flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm font-medium text-text-tertiary tracking-wide">
        AI-Powered Security Event Correlation and Incident Reconstruction
      </div>

      <div className="flex items-center gap-3">
        <InjectAttackDropdown />
        <span className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary bg-background border border-border px-3 py-1.5 rounded-md">
           <span className="w-2 h-2 rounded-full bg-accent-green"></span>
           Simulation Mode
        </span>
      </div>
    </header>
  );
};

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
