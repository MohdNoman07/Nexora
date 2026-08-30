import type { NexoraEvent } from "../types/nexora";

interface LiveFeedProps {
  events: NexoraEvent[];
}

const severityColor: Record<string, string> = {
  info: "#6b7280",
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#991b1b",
};

export function LiveFeed({ events }: LiveFeedProps) {
  return (
    <div className="panel live-feed">
      <h2>Live Activity Feed</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id} className="feed-row">
            <span
              className="severity-dot"
              style={{ background: severityColor[e.severity] }}
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