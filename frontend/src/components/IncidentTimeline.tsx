import type { Incident } from "../types/nexora";

interface IncidentTimelineProps {
  incidents: Incident[];
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <div className="panel incident-timeline">
      <h2>Incident Timeline</h2>
      {incidents.map((inc) => (
        <div key={inc.template_name + inc.start_time} className="timeline-row">
          <strong>{inc.template_name}</strong>
          <span> — {inc.matched_events.length} linked events — </span>
          <span className="badge">
            {inc.start_time} → {inc.end_time}
          </span>
        </div>
      ))}
      <p className="placeholder-note">Full graph view coming Week 4.</p>
    </div>
  );
}
