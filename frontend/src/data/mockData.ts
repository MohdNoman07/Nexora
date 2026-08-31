import type { NexoraEvent, Incident } from "../types/nexora";
export const mockEvents: NexoraEvent[] = [
  {
    id: "evt-001",
    event_type: "auth_login_failure",
    timestamp: "2026-08-24T09:12:01Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: 0.31,
  },
  {
    id: "evt-002",
    event_type: "auth_login_failure",
    timestamp: "2026-08-24T09:12:04Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: 0.52,
  },
  {
    id: "evt-003",
    event_type: "auth_login_success",
    timestamp: "2026-08-24T09:13:47Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: 0.81,
    attack_label: "credential_stuffing",
  },
  {
    id: "evt-004",
    event_type: "db_query",
    timestamp: "2026-08-24T09:14:12Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: 0.77,
    metadata: { resource: "customer_records", sensitivity: "high" },
  },
  {
    id: "evt-005",
    event_type: "data_exfiltration",
    timestamp: "2026-08-24T09:15:30Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: 0.94,
    metadata: { bytes: 48200000, destination: "external" },
  },
];

export const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    events: mockEvents,
    severity: "critical",
    confidence: 0.88,
    attack_pattern: "credential_stuffing_chain",
    timeline: {
      started_at: "2026-08-24T09:12:01Z",
      ended_at: "2026-08-24T09:15:30Z",
    },
    recommended_action:
      "Lock account j.patel, force password reset, review data-transfer destination for exfiltration.",
    entities: {
      users: ["j.patel"],
      ips: ["203.0.113.14"],
      sessions: ["sess-a1"],
    },
  },
];
