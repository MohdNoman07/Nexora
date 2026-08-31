import type { NexoraEvent } from "../types/nexora";

interface LiveFeedProps {
  events: NexoraEvent[];
}
function severityColor(score: number): string {
  if (score >= 0.8) return "#991b1b";
  if (score >= 0.6) return "#ef4444";
  if (score >= 0.35) return "#f59e0b";
  return "#3b82f6";
}

export function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div className="panel live-feed">
      <h2>Live Activity Feed</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id ?? `${e.session}-${e.timestamp}`} className="feed-row">
            <span
              className="severity-dot"
              style={{ background: severityColor(e.severity) }}
            />
            <span className="event-type">{e.event_type}</span>
            <span className="event-user">{e.user}</span>
            <span className="event-ip">{e.ip}</span>
            <span className="event-time">
              {new Date(e.timestamp).toLocaleTimeString()}
            </span>
            {e.attack_label && (
              <span className="attack-label">{e.attack_label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
