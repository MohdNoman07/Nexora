# Nexora Frontend - Security Monitoring Dashboard

AI-Powered Security Monitoring & Incident Reconstruction Platform - Dashboard Interface

## Overview

This is the frontend dashboard for Nexora, implementing a professional Security Operations Center (SOC) interface for real-time security event monitoring, anomaly visualization, and incident reconstruction.

## Features

### 1. **Live Activity Feed**

- Real-time security event stream
- Color-coded severity indicators (critical, high, medium, low)
- Event type classification
- Attack label highlighting for detected threats
- User, IP, and timestamp tracking

### 2. **Anomaly Score Distribution**

- Visual chart showing severity patterns over time
- Color-coded bars (red for high severity, yellow for medium, blue for low)
- Time-based event grouping

### 3. **Incident Timeline**

- Correlated multi-event incidents
- Clickable incident cards with severity indicators
- Attack chain templates (credential compromise, brute force, port scanning, data exfiltration)
- Entity tracking (user, IP)
- Time window visualization

### 4. **Evidence & Recommended Actions Panel**

- Detailed incident breakdown
- Event chain visualization with timestamps
- Context-aware recommended security actions
- Attack pattern descriptions
- Metadata and forensic details

### 5. **Dashboard Statistics**

- Total events counter
- Critical alerts tracking
- Active incidents count
- System status indicator

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with modern features (Grid, Flexbox, animations)
- **Dark theme** optimized for SOC environments

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`

## Design Highlights

### SOC-Optimized Interface

- Dark theme reduces eye strain during long monitoring sessions
- Color-coded severity enables quick threat assessment
- Information density balanced with readability
- Minimal animations to avoid distraction

### Visual Hierarchy

1. Critical alerts prominently highlighted
2. Correlated incidents prioritized over individual events
3. Evidence and recommended actions easily accessible
4. Clean, professional aesthetics

## Mock Data Scenarios

The dashboard demonstrates three attack scenarios:

1. **Credential Compromise → Exfiltration** (7 events)
2. **Port Scanning** (2 events)
3. **Brute Force Attack** (4 events)

## Color Palette

- Background: `#0f172a` (dark slate)
- Panels: `#1e293b` (lighter slate)
- Primary: `#3b82f6` (blue)
- Warning: `#f59e0b` (amber)
- Critical: `#ef4444` (red)
- Success: `#10b981` (green)

## Future Backend Integration

When connecting to FastAPI backend:

- Replace mock data with WebSocket connections
- Implement API calls to `/api/events` and `/api/incidents`
- Add filtering and search capabilities
- Enable incident response actions

---

Built for the AI-Powered Security Monitoring & Incident Reconstruction Platform
