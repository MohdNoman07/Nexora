import { mockEvents, mockIncidents } from "./data/mockData";
import { LiveFeed } from "./components/LiveFeed";
import { AnomalyChart } from "./components/AnomalyChart";
import { IncidentTimeline } from "./components/IncidentTimeline";
import { EvidencePanel } from "./components/EvidencePanel";
function App() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Nexora</h1>
        <span className="subtitle">Security Event Correlation — Dashboard</span>
      </header>

      <main className="dashboard-grid">
        <LiveFeed events={mockEvents} />
        <AnomalyChart events={mockEvents} />
        <IncidentTimeline incidents={mockIncidents} />
        <EvidencePanel incident={mockIncidents[0]} />
      </main>
    </div>
  );
}

export default App;
