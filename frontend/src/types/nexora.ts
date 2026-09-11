export type EventType =
  | "auth_login_success"
  | "auth_login_failure"
  | "auth_logout"
  | "api_call"
  | "db_query"
  | "file_access"
  | "port_scan"
  | "brute_force_attempt"
  | "data_exfiltration";

export interface NexoraEvent {
  event_type: EventType;
  timestamp: string;
  user: string;
  ip: string;
  session: string;
  anomaly_score: number;
  severity: number;
  metadata?: Record<string, string | number>;
  id?: string;
  attack_label?: string;
}

export interface CorrelationExplanation {
  reason: string;
  sharedEntities: string[];
  timeWindow: string;
  patternMatched: string;
  aggregateRiskScore: number;
  severityBoost: string;
}

export interface Incident {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  recommended_action: string[];
  template_name: string;
  description: string;
  matched_events: string[];
  entity: Record<string, string>;
  start_time: string;
  end_time: string;
  correlationExplanation?: CorrelationExplanation;
}
