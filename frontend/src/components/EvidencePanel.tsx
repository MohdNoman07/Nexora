import type { Incident, NexoraEvent } from "../types/nexora";

interface EvidencePanelProps {
  incident: Incident | undefined;
  events: NexoraEvent[];
}

export function EvidencePanel({ incident, events }: EvidencePanelProps) {
  if (!incident) {
    return (
      <div className="panel evidence-panel">
        <h2>Evidence & Recommended Action</h2>
        <p className="placeholder-note">
          Select an incident from the timeline to view details
        </p>
      </div>
    );
  }

  const matchedEventDetails = events.filter((e) =>
    incident.matched_events.includes(e.id || ""),
  );

  const getRecommendedActions = (templateName: string): string[] => {
    const actions: Record<string, string[]> = {
      credential_compromise_exfiltration: [
        "Immediately disable user account and force password reset",
        "Review all recent access from this IP address",
        "Audit data access logs for potential data exfiltration",
        "Notify security team and affected data owners",
        "Check for lateral movement from compromised account",
      ],
      brute_force_attack: [
        "Block source IP address at firewall level",
        "Enable account lockout after failed login attempts",
        "Force MFA for affected accounts",
        "Monitor for distributed attack patterns",
      ],
      port_scan_detected: [
        "Block scanning IP at network perimeter",
        "Review firewall rules for unnecessary open ports",
        "Check IDS/IPS logs for follow-up attacks",
        "Document and report reconnaissance activity",
      ],
      data_exfiltration: [
        "Isolate affected systems from network",
        "Preserve forensic evidence",
        "Contact incident response team immediately",
        "Review DLP policies and enforcement",
      ],
    };

    return (
      actions[templateName] || [
        "Review incident details with security team",
        "Follow standard incident response procedures",
        "Document findings for post-incident analysis",
      ]
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="panel evidence-panel">
      <h2>Evidence & Recommended Action</h2>

      <div className="evidence-content">
        <div className="evidence-section">
          <h3>Incident Details</h3>
          <p>
            <strong>Template:</strong>{" "}
            {incident.template_name.replace(/_/g, " ").toUpperCase()}
          </p>
          <p>
            <strong>Description:</strong> {incident.description}
          </p>
          <p>
            <strong>Affected Entity:</strong>{" "}
            {Object.entries(incident.entity)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </p>
          <p>
            <strong>Time Window:</strong> {formatTimestamp(incident.start_time)}{" "}
            → {formatTimestamp(incident.end_time)}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {Math.round(
              (new Date(incident.end_time).getTime() -
                new Date(incident.start_time).getTime()) /
                1000,
            )}{" "}
            seconds
          </p>
        </div>

        <div className="evidence-section">
          <h3>Event Chain ({matchedEventDetails.length} events)</h3>
          <div className="event-chain">
            {matchedEventDetails.map((event, idx) => (
              <div key={event.id} className="chain-event">
                <div
                  style={{
                    fontWeight: 600,
                    color: "#60a5fa",
                    marginBottom: "4px",
                  }}
                >
                  {idx + 1}. {event.event_type.replace(/_/g, " ").toUpperCase()}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  {formatTimestamp(event.timestamp)} • Severity:{" "}
                  {(event.severity * 100).toFixed(0)}%
                </div>
                {event.metadata && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      marginTop: "4px",
                    }}
                  >
                    {Object.entries(event.metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" • ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recommended-action">
        <h3>
          <span style={{ fontSize: "1.2rem" }}>⚠</span>
          Recommended Actions
        </h3>
        <ul>
          {getRecommendedActions(incident.template_name).map((action, idx) => (
            <li key={idx}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
