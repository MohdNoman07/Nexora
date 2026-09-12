/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { Lock, Database, FileText, Activity, Network, ShieldAlert, KeyRound } from 'lucide-react';
import type { EventType } from '../types/nexora';

// ─── Severity → colour (functional signal system, not decoration) ────────────

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: 'var(--color-sev-critical)',
  High: 'var(--color-sev-high)',
  Medium: 'var(--color-sev-medium)',
  Low: 'var(--color-sev-low)',
};

export function SeverityTag({ severity }: { severity: string }) {
  const color = SEVERITY_COLOR[severity as Severity] ?? 'var(--color-sev-info)';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wide border rounded-sm"
      style={{ color, borderColor: color + '55', backgroundColor: color + '14' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {severity.toUpperCase()}
    </span>
  );
}

export function ScoreTag({ value }: { value: number }) {
  const color = value >= 0.8 ? 'var(--color-sev-critical)' : value >= 0.5 ? 'var(--color-sev-high)' : 'var(--color-text-secondary)';
  return (
    <span className="readout text-xs font-medium" style={{ color }}>
      {value.toFixed(2)}
    </span>
  );
}

// ─── Panel shell — flat, hairline-bordered, no shadow ─────────────────────────

export function Panel({
  title, subtitle, action, children, className = '', accent,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`bg-ink-1 border border-line rounded-sm flex flex-col ${className}`}
      style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : undefined}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between gap-3">
          <div>
            {title && <h2 className="font-mono text-sm font-semibold text-text-primary tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Event-type presentation helpers, shared across pages ─────────────────────

export const EVENT_LABEL: Record<string, string> = {
  auth_login_failure: 'Auth Failure',
  auth_login_success: 'Auth Success',
  auth_logout: 'Logout',
  db_query: 'DB Query',
  file_access: 'File Access',
  data_exfiltration: 'Data Exfiltration',
  port_scan: 'Port Scan',
  brute_force_attempt: 'Brute Force',
  privilege_escalation: 'Privilege Escalation',
  api_call: 'API Call',
};

export function eventLabel(type: string): string {
  return EVENT_LABEL[type] ?? type.replace(/_/g, ' ');
}

export function EventIcon({ type, className = 'w-3.5 h-3.5' }: { type: EventType | string; className?: string }) {
  if (type.includes('auth_login_failure')) return <Lock className={className} style={{ color: 'var(--color-sev-high)' }} />;
  if (type.includes('auth_login_success')) return <Lock className={className} style={{ color: 'var(--color-signal)' }} />;
  if (type === 'db_query') return <Database className={className} style={{ color: 'var(--color-sev-critical)' }} />;
  if (type === 'file_access') return <FileText className={className} style={{ color: 'var(--color-text-secondary)' }} />;
  if (type === 'data_exfiltration') return <ShieldAlert className={className} style={{ color: 'var(--color-sev-critical)' }} />;
  if (type === 'port_scan') return <Network className={className} style={{ color: 'var(--color-sev-low)' }} />;
  if (type === 'brute_force_attempt') return <KeyRound className={className} style={{ color: 'var(--color-sev-critical)' }} />;
  return <Activity className={className} style={{ color: 'var(--color-text-secondary)' }} />;
}

// ─── Incident template → human label ──────────────────────────────────────────

const TEMPLATE_LABEL: Record<string, string> = {
  credential_compromise_exfiltration: 'Credential Stuffing → Data Exfiltration',
  data_exfiltration: 'Abnormal Authentication → Data Exfiltration',
  port_scan_detected: 'Port Scan / Reconnaissance',
  brute_force_attack: 'Brute Force Attack',
};

export function templateLabel(templateName: string): string {
  return TEMPLATE_LABEL[templateName] ?? templateName.replace(/_/g, ' ').toUpperCase();
}
