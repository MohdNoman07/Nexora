export type EventType =
  | "auth_login_success"
  | "auth_login_failure"
  | "auth_logout"
  | "api_call"
  | "db_query"
  | "file_access"
  | "port_scan"
  | "brute_force_attempt"
  | "privilege_escalation"
  | "data_exfiltration";

export interface NexoraEvent {
  event_type: EventType;
  timestamp: string;
  user: string;
  ip: string;
  session: string;
  severity: number;
  metadata?: Record<string, string | number>;
  id?: string;
  attack_label?: string;
}
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface Incident {
  id: string;
  events: NexoraEvent[];
  severity: IncidentSeverity;
  confidence: number;
  attack_pattern: string;
  timeline: {
    started_at: string;
    ended_at: string;
  };
  recommended_action: string;
  entities: {
    users: string[];
    ips: string[];
    sessions: string[];
  };
}
