// ── Mock data for Nexora Cybersecurity Dashboard ────────────────────────────

export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type NodeType = 'ip' | 'user' | 'api' | 'server' | 'database' | 'firewall' | 'cloud';

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  threat?: 'critical' | 'high' | 'medium' | null;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fixed?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: EventSeverity;
  label: string;
  method?: string;
  endpoint?: string;
  ip?: string;
  detail: string;
}

export interface Threat {
  id: string;
  title: string;
  endpoint: string;
  confidence: number;
  relatedEvents: number;
  attackChain: string;
  firstSeen: string;
  severity: EventSeverity;
  nodeId: string;
}

// ── Graph Nodes ──────────────────────────────────────────────────────────────
export const GRAPH_NODES: GraphNode[] = [
  { id: 'ext-ip-1',   label: '185.42.91.8',    sublabel: 'External IP',       type: 'ip',       threat: 'critical' },
  { id: 'admin-user', label: 'admin',           sublabel: 'User Account',      type: 'user',     threat: null      },
  { id: 'api-login',  label: '/api/login',      sublabel: '47 failed attempts',type: 'api',      threat: 'high'    },
  { id: 'api-users',  label: '/api/users',      sublabel: 'Suspicious query',  type: 'api',      threat: 'critical'},
  { id: 'db-1',       label: 'db-1',            sublabel: 'Sensitive Data',    type: 'database', threat: 'high'    },
  { id: 'server-1',   label: 'web-srv-01',      sublabel: 'Production',        type: 'server',   threat: null      },
  { id: 'firewall-1', label: 'fw-edge',         sublabel: 'Perimeter',         type: 'firewall', threat: null      },
  { id: 'cloud-1',    label: 'aws-vpc',         sublabel: 'Cloud',             type: 'cloud',    threat: null      },
  { id: 'ext-ip-2',   label: '91.203.18.44',   sublabel: 'Tor Exit Node',     type: 'ip',       threat: 'medium'  },
  { id: 'api-search', label: '/api/search',     sublabel: 'Enumeration',       type: 'api',      threat: 'medium'  },
  { id: 'api-gateway',label: 'api-gateway',     sublabel: 'Load Balancer',     type: 'server',   threat: null      },
  { id: 'workstation',label: 'ws-finance-03',   sublabel: 'Workstation',       type: 'server',   threat: null      },
];

// ── Graph Edges ──────────────────────────────────────────────────────────────
export const GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1',  source: 'ext-ip-1',   target: 'api-login',   animated: true,  label: 'brute force'    },
  { id: 'e2',  source: 'ext-ip-1',   target: 'api-users',   animated: true,  label: 'SQL inject'     },
  { id: 'e3',  source: 'admin-user', target: 'api-login',   animated: false                           },
  { id: 'e4',  source: 'admin-user', target: 'api-users',   animated: false                           },
  { id: 'e5',  source: 'api-users',  target: 'db-1',        animated: true,  label: 'data exfil'     },
  { id: 'e6',  source: 'api-login',  target: 'server-1',    animated: false                           },
  { id: 'e7',  source: 'firewall-1', target: 'server-1',    animated: false                           },
  { id: 'e8',  source: 'server-1',   target: 'api-gateway', animated: false                           },
  { id: 'e9',  source: 'api-gateway',target: 'api-login',   animated: false                           },
  { id: 'e10', source: 'api-gateway',target: 'api-users',   animated: false                           },
  { id: 'e11', source: 'cloud-1',    target: 'server-1',    animated: false                           },
  { id: 'e12', source: 'ext-ip-2',   target: 'api-search',  animated: true,  label: 'enum'           },
  { id: 'e13', source: 'api-search', target: 'db-1',        animated: true                            },
  { id: 'e14', source: 'workstation',target: 'server-1',    animated: false                           },
];

// ── Live Events ──────────────────────────────────────────────────────────────
export const generateEvents = (): LiveEvent[] => [
  { id: 'ev-001', timestamp: '23:41:16', type: 'critical', label: 'Threat Identified',  method: 'POST', endpoint: '/api/users/search', ip: '185.42.91.8', detail: 'SQL Injection pattern matched — UNION SELECT detected' },
  { id: 'ev-002', timestamp: '23:41:14', type: 'high',     label: 'Correlation Created',method: '—',    endpoint: 'Attack chain AC-014',ip: '—',          detail: '4 related events linked across 3 endpoints' },
  { id: 'ev-003', timestamp: '23:41:12', type: 'medium',   label: 'Anomaly Detected',   method: 'GET',  endpoint: '/api/users',         ip: '192.168.1.45',detail: 'Unusual parameter structure; deviation from baseline' },
  { id: 'ev-004', timestamp: '23:41:10', type: 'medium',   label: 'Suspicious Request', method: 'POST', endpoint: '/api/login',         ip: '185.42.91.8', detail: '401 — Failed login attempt, 47th in sequence' },
  { id: 'ev-005', timestamp: '23:41:07', type: 'low',      label: 'Rate Limit Exceeded',method: 'GET',  endpoint: '/api/search',        ip: '91.203.18.44',detail: 'Request rate 420 req/min; threshold 100' },
  { id: 'ev-006', timestamp: '23:41:03', type: 'info',     label: 'Normal Event',       method: 'GET',  endpoint: '/',                  ip: '192.168.1.10',detail: '200 OK — Standard health check' },
  { id: 'ev-007', timestamp: '23:40:58', type: 'critical', label: 'Data Exfiltration',  method: 'POST', endpoint: '/api/users',         ip: '185.42.91.8', detail: 'Response body 847KB — well above baseline 2KB' },
  { id: 'ev-008', timestamp: '23:40:51', type: 'high',     label: 'Privilege Escalation',method: 'PUT', endpoint: '/api/users/admin',   ip: '10.0.0.23',   detail: 'Role modification attempt on protected account' },
];

// ── Active Threats ───────────────────────────────────────────────────────────
export const ACTIVE_THREATS: Threat[] = [
  {
<<<<<<< Updated upstream
    id: "evt-001",
    event_type: "AUTH_FAILURE",
    timestamp: "2026-08-24T09:12:01Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: "low",
    anomaly_score: 0.31,
  },
  {
    id: "evt-002",
    event_type: "AUTH_FAILURE",
    timestamp: "2026-08-24T09:12:04Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: "medium",
    anomaly_score: 0.52,
  },
  {
    id: "evt-003",
    event_type: "AUTH_SUCCESS",
    timestamp: "2026-08-24T09:13:47Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: "high",
    anomaly_score: 0.81,
    attack_label: "credential_stuffing",
  },
  {
    id: "evt-004",
    event_type: "DB_ACCESS",
    timestamp: "2026-08-24T09:14:12Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: "high",
    anomaly_score: 0.77,
    metadata: { resource: "customer_records", sensitivity: "high" },
  },
  {
    id: "evt-005",
    event_type: "DATA_TRANSFER",
    timestamp: "2026-08-24T09:15:30Z",
    user: "j.patel",
    ip: "203.0.113.14",
    session: "sess-a1",
    severity: "critical",
    anomaly_score: 0.94,
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
=======
    id: 'thr-001',
    title: 'Possible SQL Injection',
    endpoint: '/api/users/search',
    confidence: 91,
    relatedEvents: 4,
    attackChain: 'AC-014',
    firstSeen: '2 min ago',
    severity: 'critical',
    nodeId: 'api-users',
  },
  {
    id: 'thr-002',
    title: 'Credential Brute Force',
    endpoint: '/api/login',
    confidence: 78,
    relatedEvents: 2,
    attackChain: 'AC-012',
    firstSeen: '6 min ago',
    severity: 'high',
    nodeId: 'api-login',
  },
  {
    id: 'thr-003',
    title: 'API Enumeration via Tor',
    endpoint: '/api/search',
    confidence: 65,
    relatedEvents: 1,
    attackChain: 'AC-009',
    firstSeen: '11 min ago',
    severity: 'medium',
    nodeId: 'api-search',
  },
];

// ── Overview stats ───────────────────────────────────────────────────────────
export const OVERVIEW_STATS = [
  { label: 'Events', value: 1240000, display: '1.24M',  change: '+12%', positive: true  },
  { label: 'Anomalies', value: 14,   display: '14',     change: '+6%',  positive: false },
  { label: 'Active Threats', value: 3, display: '3',   change: '+200%',positive: false },
>>>>>>> Stashed changes
];
