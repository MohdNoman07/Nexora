import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/Landing/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import IncidentsList from './pages/Incidents/IncidentsList';
import IncidentDetail from './pages/Incidents/IncidentDetail';
import LiveActivity from './pages/LiveActivity/LiveActivity';
import './index.css';

function App() {
  return (
    <SimulationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="incidents" element={<IncidentsList />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="live" element={<LiveActivity />} />
            {/* Fallback route */}
            <Route path="*" element={<div className="p-8 font-mono text-sm text-text-tertiary">404 — PAGE NOT FOUND OR UNDER CONSTRUCTION</div>} />
          </Route>
        </Routes>
      </Router>
    </SimulationProvider>
  );
}

export default App;
