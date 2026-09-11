import { Outlet, NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Bug, 
  Search, 
  Shield, 
  FileText, 
  Server, 
  List, 
  Zap, 
  Settings, 
  Users, 
  Lock,
  Sun,
  Moon,
  Bell,
  Search as SearchIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  return (
    <aside className="w-64 bg-background border-r border-border h-screen flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-text-primary tracking-tight">Wallarm</span>
      </div>

      <nav className="flex-1 px-3 space-y-6">
        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">Dashboard</div>
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={<ShieldAlert className="w-4 h-4" />} label="Threat Prevention" />
            <NavItem to="/api-discovery" icon={<Search className="w-4 h-4" />} label="API Discovery" />
            <NavItem to="/owasp" icon={<Shield className="w-4 h-4" />} label="OWASP API 2026" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">Events</div>
          <div className="space-y-1">
            <NavItem to="/live" icon={<Activity className="w-4 h-4" />} label="Attacks" />
            <NavItem to="/incidents" icon={<AlertTriangle className="w-4 h-4" />} label="Incidents" />
            <NavItem to="/vulnerabilities" icon={<Bug className="w-4 h-4" />} label="Vulnerabilities" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">API Security</div>
          <div className="space-y-1">
            <NavItem to="/api-sec-discovery" icon={<Search className="w-4 h-4" />} label="API Discovery" />
            <NavItem to="/api-abuse" icon={<ShieldAlert className="w-4 h-4" />} label="API Abuse Prevention" />
            <NavItem to="/api-specs" icon={<FileText className="w-4 h-4" />} label="API Specifications" />
            <NavItem to="/openapi" icon={<Server className="w-4 h-4" />} label="OpenAPI Testing" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">Security Controls</div>
          <div className="space-y-1">
            <NavItem to="/ip-lists" icon={<List className="w-4 h-4" />} label="IP Lists" />
            <NavItem to="/triggers" icon={<Zap className="w-4 h-4" />} label="Triggers" />
            <NavItem to="/rules" icon={<Settings className="w-4 h-4" />} label="Rules" />
            <NavItem to="/credential-stuffing" icon={<Users className="w-4 h-4" />} label="Credential Stuffing" />
            <NavItem to="/bola" icon={<Lock className="w-4 h-4" />} label="BOLA Protection" />
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <div className="flex bg-panel rounded-lg p-1 border border-border">
          <button className="flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded-md text-text-secondary hover:text-text-primary">
            <Sun className="w-4 h-4" /> Light
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded-md bg-border text-text-primary shadow-sm">
            <Moon className="w-4 h-4" /> Dark
          </button>
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
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-panel text-text-primary border border-border" 
          : "text-text-secondary hover:text-text-primary hover:bg-panel/50 border border-transparent"
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
};

const Topbar = () => {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center flex-1">
        <div className="relative w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full bg-panel border border-border rounded-md py-1.5 pl-9 pr-3 text-sm text-text-primary focus:outline-none focus:border-text-tertiary transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
             <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-background border border-border rounded text-text-tertiary">⌘</kbd>
             <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-background border border-border rounded text-text-tertiary">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-panel p-1.5 rounded-md transition-colors border border-transparent hover:border-border">
          <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-sm font-medium">
            JC
          </div>
          <div className="hidden md:block text-sm">
            <div className="font-medium text-text-primary">Jane Cooper</div>
            <div className="text-text-tertiary text-xs">jane@gmail.com</div>
          </div>
        </div>
        
        <div className="h-6 w-px bg-border mx-2"></div>
        
        <button className="text-text-secondary hover:text-text-primary">
          <Settings className="w-5 h-5" />
        </button>
        <button className="text-text-secondary hover:text-text-primary relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent-red rounded-full"></span>
        </button>
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
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
