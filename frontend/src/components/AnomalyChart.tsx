import type { NexoraEvent } from "../types/nexora";

interface AnomalyChartProps {
  events: NexoraEvent[];
}

export function AnomalyChart({ events }: AnomalyChartProps) {
  const timeSlots = 10;
  const slotData: number[] = [];

  for (let i = 0; i < timeSlots; i++) {
    const slotEvents = events.filter(
      (_, idx) => Math.floor((idx / events.length) * timeSlots) === i,
    );
    const avgSeverity =
      slotEvents.length > 0
        ? slotEvents.reduce((sum, e) => sum + e.severity, 0) / slotEvents.length
        : 0;
    slotData.push(avgSeverity);
  }

  const maxSeverity = Math.max(...slotData, 1);

  return (
    <div className="panel anomaly-chart">
      <h2>Anomaly Score Distribution</h2>
      <div className="chart-container">
        {slotData.map((severity, idx) => {
          const height = (severity / maxSeverity) * 100;
          const classType =
            severity >= 0.8 ? "high" : severity >= 0.5 ? "medium" : "";

          return (
            <div
              key={idx}
              className={`chart-bar ${classType}`}
              style={{ height: `${height}%` }}
              title={`Slot ${idx + 1}: ${severity.toFixed(2)}`}
            />
          );
        })}
      </div>
      <p
        style={{
          color: "#64748b",
          fontSize: "0.8rem",
          textAlign: "center",
          marginTop: "12px",
        }}
      >
        Time-based severity distribution across {events.length} events
      </p>
    </div>
  );
}
