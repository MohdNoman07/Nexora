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

export interface Incident {
  template_name: string;
  description: string;
  matched_events: string[];
  entity: Record<string, string>;
  start_time: string;
  end_time: string;
}
