export type EventType =
  | "AUTH_FAILURE"
  | "AUTH_SUCCESS"
  | "API_REQUEST"
  | "DB_ACCESS"
  | "FILE_ACCESS"
  | "NETWORK_CONNECTION"
  | "DATA_TRANSFER";

export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface NexoraEvent {
  id: string;
  event_type: EventType;
  timestamp: string;
  user: string;
  ip: string;
  session: string;
  severity: Severity;
  anomaly_score?: number;
  attack_label?: string;
  metadata?: Record<string, string | number>;
}

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
