import type { Incident } from "../types/nexora";

interface EvidencePanelProps {
  incident: Incident | undefined;
}

export function EvidencePanel({ incident }: EvidencePanelProps) {
  if (!incident) {
    return (
      <div className="panel evidence-panel">
        <h2>Evidence & Recommended Action</h2>
        <p className="placeholder-note">No incident selected.</p>
      </div>
    );
  }

  return (
    <div className="panel evidence-panel">
      <h2>Evidence & Recommended Action</h2>
      <p>
        <strong>Confidence:</strong> {(incident.confidence * 100).toFixed(0)}%
      </p>
      <p>
        <strong>Entities:</strong> {incident.entities.users.join(", ")} /{" "}
        {incident.entities.ips.join(", ")}
      </p>
      <p>
        <strong>Recommended action:</strong> {incident.recommended_action}
      </p>
    </div>
  );
}
