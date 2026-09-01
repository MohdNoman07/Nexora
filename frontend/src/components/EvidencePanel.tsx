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
        <strong>Template:</strong> {incident.template_name}
      </p>
      <p>
        <strong>Description:</strong> {incident.description}
      </p>
      <p>
        <strong>Entity:</strong>{" "}
        {Object.entries(incident.entity)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}
      </p>
      <p>
        <strong>Matched events:</strong> {incident.matched_events.join(", ")}
      </p>
    </div>
  );
}
