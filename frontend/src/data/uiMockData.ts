export const attackTargetsData = [
  { domain: 'main-api.us.demo.wallarm.tools', incidents: 10, hits: '6.92M', trend: '717% ↑', trendColor: 'red' },
  { domain: 'api2.us.demo.wallarm.tools', incidents: null, hits: '30.9K', trend: '15.1% ↓', trendColor: 'green' },
  { domain: 'api3.us.demo.wallarm.tools', incidents: null, hits: '27.9K', trend: '38.5% ↓', trendColor: 'green' },
  { domain: 'api4.us.demo.wallarm.tools', incidents: null, hits: '26.5K', trend: '5.8% ↑', trendColor: 'red' },
  { domain: 'apil.us.demo.wallarm.tools', incidents: null, hits: '26.4K', trend: '15.5% ↓', trendColor: 'green' },
  { domain: 'localstage', incidents: null, hits: '200', trend: '8.5% ↓', trendColor: 'green' },
  { domain: 'dev.twistshop.com', incidents: null, hits: '171', trend: '12.5% ↓', trendColor: 'green' },
  { domain: '127.0.0.1:80', incidents: null, hits: '36', trend: '4.1% ↑', trendColor: 'red' },
  { domain: '5175168.38', incidents: null, hits: '345', trend: '13.5% ↓', trendColor: 'green' },
  { domain: 'api4.us.demo.wallarm.tools', incidents: null, hits: '53', trend: '7.4% ↑', trendColor: 'red' },
];

export const trafficChartData = Array.from({ length: 100 }).map((_, i) => {
  const base = 50 + Math.random() * 20;
  const spike = i === 85 ? 40 : 0;
  return {
    name: `Point ${i}`,
    hits: base + Math.sin(i / 5) * 10,
    requests: base * 1.5 + Math.cos(i / 5) * 15,
    incidents: spike > 0 ? spike : Math.random() > 0.9 ? Math.random() * 5 : 0
  };
});

export const mapData = [
  { id: 'USA', coordinates: [-100, 40], attacks: 3, percentage: 4, name: 'USA', color: 'bg-accent-blue/50' },
  { id: 'BRA', coordinates: [-55, -10], attacks: 0, percentage: 0, name: 'Brazil', color: 'bg-accent-orange/50' },
  { id: 'RUS', coordinates: [100, 60], attacks: 0, percentage: 0, name: 'Russia', color: 'bg-accent-orange/50' },
  { id: 'CHN', coordinates: [104, 35], attacks: 0, percentage: 0, name: 'China', color: 'bg-accent-orange/50' },
  { id: 'AUS', coordinates: [133, -25], attacks: 0, percentage: 0, name: 'Australia', color: 'bg-accent-orange/50' },
];

export const mockIncidentDetails = {
  'INC-1024': {
    summary: {
      id: 'INC-1024',
      severity: 'Critical',
      riskScore: 95,
      attackType: 'Brute force / credential stuffing',
      status: 'Open',
      affectedEntities: ['auth-service', 'admin-db'],
      detectionTime: '2026-03-24T14:30:00Z'
    },
    timeline: [
      { id: 'ev-1', type: 'auth-failure-burst', time: '14:30:00', icon: 'shield-alert' },
      { id: 'ev-2', type: 'successful-login-from-new-source', time: '14:32:15', icon: 'user' },
      { id: 'ev-3', type: 'privileged-resource-access', time: '14:33:40', icon: 'lock' },
      { id: 'ev-4', type: 'large-data-transfer', time: '14:35:00', icon: 'database' }
    ],
    evidence: [
      { timestamp: '14:30:00', user: 'system', ip: '192.168.1.100', session: 's-100', eventType: 'auth-failure', anomalyScore: 0.9, classification: 'attack', resource: '/login' },
      { timestamp: '14:32:15', user: 'admin', ip: '192.168.1.100', session: 's-101', eventType: 'login-success', anomalyScore: 0.8, classification: 'anomalous', resource: '/login' },
      { timestamp: '14:33:40', user: 'admin', ip: '192.168.1.100', session: 's-101', eventType: 'db-access', anomalyScore: 0.95, classification: 'attack', resource: '/api/v1/users/export' },
      { timestamp: '14:35:00', user: 'admin', ip: '192.168.1.100', session: 's-101', eventType: 'data-transfer', anomalyScore: 0.99, classification: 'critical', resource: 's3://backup' }
    ],
    correlationExplanation: {
      reason: 'Events were correlated because they share the same user/IP/session and occurred within the configured time window.',
      sharedEntities: ['IP: 192.168.1.100', 'Session: s-101'],
      timeWindow: '5 minutes',
      patternMatched: 'Brute Force -> Account Takeover -> Data Exfiltration',
      aggregateRiskScore: 95,
      severityBoost: '+20 points due to matching known attack chain pattern.'
    },
    recommendedAction: 'Immediately block IP 192.168.1.100, revoke session s-101, and force password reset for user "admin".'
  }
};

export const mockIncidents = [
  {
    id: 'INC-1024',
    severity: 'Critical',
    attackType: 'Brute force / credential stuffing',
    status: 'Open',
    firstDetected: '2026-03-24T14:30:00Z',
    sourceIp: '192.168.1.100',
    user: 'admin',
    eventsCount: 4,
  },
  {
    id: 'INC-1023',
    severity: 'High',
    attackType: 'SQL Injection',
    status: 'Open',
    firstDetected: '2026-03-23T11:15:00Z',
    sourceIp: '203.0.113.55',
    user: 'j.patel',
    eventsCount: 7,
  },
  {
    id: 'INC-1022',
    severity: 'Medium',
    attackType: 'Port Scan / Reconnaissance',
    status: 'Resolved',
    firstDetected: '2026-03-22T09:00:00Z',
    sourceIp: '192.0.2.88',
    user: 'unknown',
    eventsCount: 2,
  },
  {
    id: 'INC-1021',
    severity: 'High',
    attackType: 'Data Exfiltration',
    status: 'Open',
    firstDetected: '2026-03-21T17:45:00Z',
    sourceIp: '198.51.100.42',
    user: 's.kumar',
    eventsCount: 5,
  },
];
