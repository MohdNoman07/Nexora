import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import IncidentsList from './pages/Incidents/IncidentsList';
import IncidentDetail from './pages/Incidents/IncidentDetail';
import LiveActivity from './pages/LiveActivity/LiveActivity';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<IncidentsList />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="live" element={<LiveActivity />} />
          {/* Fallback route */}
          <Route path="*" element={<div className="p-8 text-text-secondary">Page not found or under construction.</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
