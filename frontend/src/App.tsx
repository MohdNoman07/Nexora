<<<<<<< Updated upstream
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
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import IncidentsList from './pages/Incidents/IncidentsList';
import LiveActivity from './pages/LiveActivity/LiveActivity';
import CorrelationPage from './pages/Correlation/CorrelationPage';
import 'lenis/dist/lenis.css';
import './index.css';

function App() {
  return (
    <ReactLenis root options={{ autoRaf: true, lerp: 0.08, smoothWheel: true }}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="live"         element={<LiveActivity />} />
            <Route path="correlation"  element={<CorrelationPage />} />
            <Route path="incidents"    element={<IncidentsList />} />
            <Route path="*" element={
              <div className="flex items-center justify-center h-full text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Page under construction.
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </ReactLenis>
>>>>>>> Stashed changes
  );
}

export default App;
