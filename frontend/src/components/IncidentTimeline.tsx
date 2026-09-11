import type { Incident } from "../types/nexora";

interface IncidentTimelineProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  selectedIncident?: Incident;
}

export function IncidentTimeline({
  incidents,
  onSelectIncident,
  selectedIncident,
}: IncidentTimelineProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSeverityClass = (eventCount: number): string => {
    if (eventCount >= 5) return "critical";
    if (eventCount >= 3) return "high";
    return "medium";
  };

  return (
    <div className="panel incident-timeline">
      <h2>Incident Timeline</h2>
      {incidents.length === 0 ? (
        <p className="placeholder-note">No incidents detected</p>
      ) : (
        incidents.map((inc) => {
          const isSelected =
            selectedIncident?.template_name === inc.template_name &&
            selectedIncident?.start_time === inc.start_time;

          return (
            <div
              key={inc.template_name + inc.start_time}
              className={`timeline-row ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectIncident?.(inc)}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>
                  {inc.template_name.replace(/_/g, " ").toUpperCase()}
                </strong>
                <span
                  className={`severity-indicator ${getSeverityClass(inc.matched_events.length)}`}
                >
                  {getSeverityClass(inc.matched_events.length)}
                </span>
              </div>
              <span>
                {inc.matched_events.length} linked events • Entity:{" "}
                {Object.values(inc.entity)[0]}
              </span>
              <span className="badge">
                {formatTime(inc.start_time)} → {formatTime(inc.end_time)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
