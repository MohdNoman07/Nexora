/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { NexoraEvent, Incident } from '../types/nexora';
import { mockEvents, mockIncidents } from '../data/mockData';

// ─── Public types ──────────────────────────────────────────────────────────────

export type AttackScenario = 'credential_stuffing' | 'port_scan' | 'exfiltration';
export type InjectionStatus = 'idle' | 'injecting' | 'done';

interface SimulationContextType {
  events: NexoraEvent[];
  incidents: Incident[];
  injectAttack: (type: AttackScenario) => void;
  injectionStatus: InjectionStatus;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation(): SimulationContextType {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}

// ─── Attack event sequence builders ───────────────────────────────────────────

function buildEvents(
  type: AttackScenario,
  baseTs: number,
  prefix: string
): NexoraEvent[] {
  // Timestamps offset in real seconds from injection time (for display)
  const ts = (offsetSec: number) =>
    new Date(baseTs + offsetSec * 1000).toISOString();

  if (type === 'credential_stuffing') {
    const user = 'a.chen';
    const ip = '198.51.100.44';
    const session = `sess-${prefix}`;
    return [
      {
        id: `${prefix}-1`,
        event_type: 'auth_login_failure',
        timestamp: ts(0),
        user, ip, session,
        anomaly_score: 0.82,
        severity: 0.35,
      },
      {
        id: `${prefix}-2`,
        event_type: 'auth_login_failure',
        timestamp: ts(3),
        user, ip, session,
        anomaly_score: 0.87,
        severity: 0.52,
      },
      {
        id: `${prefix}-3`,
        event_type: 'auth_login_failure',
        timestamp: ts(6),
        user, ip, session,
        anomaly_score: 0.90,
        severity: 0.65,
      },
      {
        id: `${prefix}-4`,
        event_type: 'auth_login_success',
        timestamp: ts(90),
        user, ip, session,
        anomaly_score: 0.83,
        severity: 0.80,
        attack_label: 'credential_stuffing',
      },
      {
        id: `${prefix}-5`,
        event_type: 'db_query',
        timestamp: ts(95),
        user, ip, session,
        anomaly_score: 0.94,
        severity: 0.75,
        metadata: { resource: 'user_records', sensitivity: 'high' },
      },
      {
        id: `${prefix}-6`,
        event_type: 'file_access',
        timestamp: ts(120),
        user, ip, session,
        anomaly_score: 0.73,
        severity: 0.70,
        metadata: { file: 'employee_data.csv', action: 'read' },
      },
      {
        id: `${prefix}-7`,
        event_type: 'data_exfiltration',
        timestamp: ts(180),
        user, ip, session,
        anomaly_score: 0.98,
        severity: 0.92,
        metadata: { bytes: 52400000, destination: 'external' },
        attack_label: 'exfiltration',
      },
    ];
  }

  if (type === 'port_scan') {
    const user = 'unknown';
    const ip = '203.0.113.77';
    const session = `sess-${prefix}`;
    return [
      {
        id: `${prefix}-1`,
        event_type: 'port_scan',
        timestamp: ts(0),
        user, ip, session,
        anomaly_score: 0.89,
        severity: 0.70,
        metadata: { ports_scanned: 512, duration: '30s' },
        attack_label: 'reconnaissance',
      },
      {
        id: `${prefix}-2`,
        event_type: 'port_scan',
        timestamp: ts(30),
        user, ip, session,
        anomaly_score: 0.93,
        severity: 0.78,
        metadata: { ports_scanned: 1536, duration: '65s' },
      },
      {
        id: `${prefix}-3`,
        event_type: 'port_scan',
        timestamp: ts(90),
        user, ip, session,
        anomaly_score: 0.97,
        severity: 0.85,
        metadata: { ports_scanned: 3072, duration: '120s' },
      },
    ];
  }

  // exfiltration — uses credential_compromise_exfiltration template per existing data model
  const user = 'r.singh';
  const ip = '198.51.100.55';
  const session = `sess-${prefix}`;
  return [
    {
      id: `${prefix}-1`,
      event_type: 'auth_login_failure',
      timestamp: ts(0),
      user, ip, session,
      anomaly_score: 0.75,
      severity: 0.42,
    },
    {
      id: `${prefix}-2`,
      event_type: 'auth_login_failure',
      timestamp: ts(4),
      user, ip, session,
      anomaly_score: 0.80,
      severity: 0.55,
    },
    {
      id: `${prefix}-3`,
      event_type: 'auth_login_success',
      timestamp: ts(60),
      user, ip, session,
      anomaly_score: 0.84,
      severity: 0.78,
    },
    {
      id: `${prefix}-4`,
      event_type: 'data_exfiltration',
      timestamp: ts(90),
      user, ip, session,
      anomaly_score: 0.99,
      severity: 0.95,
      metadata: { bytes: 87500000, destination: 'external' },
      attack_label: 'exfiltration',
    },
  ];
}

// ─── Incident builder — fully populates every Incident field ──────────────────

function buildIncident(
  type: AttackScenario,
  events: NexoraEvent[],
  incId: string
): Incident {
  const eventIds = events.map(e => e.id as string);
  const startTime = events[0].timestamp;
  const endTime = events[events.length - 1].timestamp;

  if (type === 'credential_stuffing') {
    const user = events[0].user;
    const ip = events[0].ip;
    return {
      id: incId,
      severity: 'Critical',
      confidence: 0.93,
      template_name: 'credential_compromise_exfiltration',
      description:
        'Burst of failed logins followed by successful login, privileged database access, and large data transfer. Classic credential stuffing → exfiltration pattern.',
      matched_events: eventIds,
      entity: { user, ip },
      start_time: startTime,
      end_time: endTime,
      recommended_action: [
        'Immediately disable user account and force password reset',
        'Review all recent access from this IP address',
        'Audit data access logs for potential data exfiltration',
        'Notify security team and affected data owners',
        'Check for lateral movement from compromised account',
      ],
      correlationExplanation: {
        reason:
          'Events were correlated because they share the same user and IP within a tight time window.',
        sharedEntities: [`User: ${user}`, `IP: ${ip}`],
        timeWindow: '3 minutes',
        patternMatched: 'Credential Stuffing → Data Exfiltration',
        aggregateRiskScore: 93,
        severityBoost: 'Elevated severity due to matching known credential stuffing attack chain pattern.',
      },
    };
  }

  if (type === 'port_scan') {
    const ip = events[0].ip;
    return {
      id: incId,
      severity: 'High',
      confidence: 0.88,
      template_name: 'port_scan_detected',
      description:
        'Network port scanning activity detected from external IP. Escalating scan volume indicates systematic reconnaissance for targeted attack.',
      matched_events: eventIds,
      entity: { ip },
      start_time: startTime,
      end_time: endTime,
      recommended_action: [
        'Block scanning IP at network perimeter immediately',
        'Review firewall rules for unnecessary open ports',
        'Check IDS/IPS logs for follow-up attack attempts',
        'Document and report reconnaissance activity to security team',
      ],
      correlationExplanation: {
        reason:
          'Events were correlated because they share the same source IP with escalating scan volume within a short window.',
        sharedEntities: [`IP: ${ip}`],
        timeWindow: '90 seconds',
        patternMatched: 'Port Scan / Reconnaissance',
        aggregateRiskScore: 85,
        severityBoost: 'Elevated severity due to escalating scan volume and sustained duration.',
      },
    };
  }

  // exfiltration
  const user = events[0].user;
  const ip = events[0].ip;
  return {
    id: incId,
    severity: 'Critical',
    confidence: 0.91,
    template_name: 'credential_compromise_exfiltration',
    description:
      'Account compromise followed by immediate high-volume data exfiltration. Rapid progression from authentication failure to data transfer suggests targeted insider-threat or credential-based attack.',
    matched_events: eventIds,
    entity: { user, ip },
    start_time: startTime,
    end_time: endTime,
    recommended_action: [
      'Immediately disable user account and initiate account review',
      'Block outbound traffic from source IP at perimeter',
      'Identify and scope the exfiltrated data',
      'Notify data protection officer and affected stakeholders',
      'Preserve logs and initiate forensic investigation',
    ],
    correlationExplanation: {
      reason:
        'Events were correlated because they share the same user and IP, with rapid progression from failed authentication to high-volume data exfiltration.',
      sharedEntities: [`User: ${user}`, `IP: ${ip}`],
      timeWindow: '90 seconds',
      patternMatched: 'Abnormal Authentication → Data Exfiltration',
      aggregateRiskScore: 96,
      severityBoost: 'Elevated severity due to immediate high-volume data transfer following authentication.',
    },
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<NexoraEvent[]>([...mockEvents]);
  const [incidents, setIncidents] = useState<Incident[]>([...mockIncidents]);
  const [injectionStatus, setInjectionStatus] = useState<InjectionStatus>('idle');

  // Counter for generating non-colliding incident IDs
  const incidentCounter = useRef(1025);
  // Guard against concurrent injections
  const isInjecting = useRef(false);

  const injectAttack = useCallback((type: AttackScenario) => {
    if (isInjecting.current) return;
    isInjecting.current = true;
    setInjectionStatus('injecting');

    const baseTs = Date.now();
    const prefix = `inj-${baseTs}`;
    const sequence = buildEvents(type, baseTs, prefix);

    incidentCounter.current += 1;
    const incId = `INC-${incidentCounter.current}`;

    // Stream events one-by-one at 300 ms intervals for visible live-feed effect
    let i = 0;
    const addNext = () => {
      if (i < sequence.length) {
        const ev = sequence[i];
        setEvents(prev => [...prev, ev]);
        i++;
        setTimeout(addNext, 300);
      } else {
        // All events added — construct and register the incident
        const incident = buildIncident(type, sequence, incId);
        setIncidents(prev => [incident, ...prev]);
        setInjectionStatus('done');
        setTimeout(() => {
          setInjectionStatus('idle');
          isInjecting.current = false;
        }, 1500);
      }
    };

    setTimeout(addNext, 0);
  }, []);

  return (
    <SimulationContext.Provider value={{ events, incidents, injectAttack, injectionStatus }}>
      {children}
    </SimulationContext.Provider>
  );
}
