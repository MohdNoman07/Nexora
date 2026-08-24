import type { NexoraEvent } from "../types/nexora";

interface AnomalyChartProps {
  events: NexoraEvent[];
}

export function AnomalyChart({ events }: AnomalyChartProps) {
  return (
    <div className="panel anomaly-chart">
      <h2>Anomaly Score</h2>
      <p className="placeholder-note">
        {events.length} events loaded — chart coming Week 3.
      </p>
    </div>
  );
}
