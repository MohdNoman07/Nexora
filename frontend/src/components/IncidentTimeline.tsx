import type { Incident } from "../types/nexora";

interface IncidentTimelineProps {
  incidents: Incident[];
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <div className="panel incident-timeline">
      <h2>Incident Timeline</h2>
      {incidents.map((inc) => (
        <div key={inc.id} className="timeline-row">
          <strong>{inc.attack_pattern}</strong>
          <span> — {inc.events.length} linked events — </span>
          <span className={`badge severity-${inc.severity}`}>
            {inc.severity}
          </span>
        </div>
      ))}
      <p className="placeholder-note">Full graph view coming Week 4.</p>
    </div>
  );
}
