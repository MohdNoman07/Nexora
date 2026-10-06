import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { api, openEventSocket, type WsMessage } from "../api/client";
import type { Incident, LiveStats, NexoraEvent } from "../types/nexora";

interface LiveContextValue {
  connected: boolean;
  events: NexoraEvent[];
  incidents: Incident[];
  latestIncident: Incident | null;
  stats: LiveStats;
  injectAttack: (type?: string) => Promise<void>;
  attackTypes: string[];
}

const DEFAULT_STATS: LiveStats = {
  events: 0,
  anomalies: 0,
  active_threats: 0,
  ws_clients: 0,
  window_size: 0,
};

const SCOPED_ATTACKS = ["brute_force", "port_scan", "data_exfiltration", "api_abuse"];

const LiveContext = createContext<LiveContextValue | null>(null);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<NexoraEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [latestIncident, setLatestIncident] = useState<Incident | null>(null);
  const [stats, setStats] = useState<LiveStats>(DEFAULT_STATS);
  const [attackTypes, setAttackTypes] = useState<string[]>(SCOPED_ATTACKS);
  const seenIncidentIds = useRef<Set<string>>(new Set());

  // Initial snapshot (so first paint isn't empty even before WS warms up)
  useEffect(() => {
    api.events(25).then((evs) => setEvents(evs.reverse())).catch(() => {});
    api.incidents(25).then((incs) => {
      setIncidents(incs);
      incs.forEach((i) => seenIncidentIds.current.add(i.id));
      if (incs.length) setLatestIncident(incs[0]);
    }).catch(() => {});
    api.attackTypes().then((r) => setAttackTypes(r.attack_types)).catch(() => {});
  }, []);

  // Live socket
  useEffect(() => {
    const onMessage = (msg: WsMessage) => {
      if (msg.type === "event") {
        setEvents((prev) => [msg.data, ...prev].slice(0, 200));
      } else if (msg.type === "incident") {
        if (seenIncidentIds.current.has(msg.data.id)) return;
        seenIncidentIds.current.add(msg.data.id);
        setIncidents((prev) => [msg.data, ...prev].slice(0, 100));
        setLatestIncident(msg.data);
      } else if (msg.type === "stats") {
        setStats(msg.data);
      }
    };
    return openEventSocket(onMessage, setConnected);
  }, []);

  const injectAttack = useCallback(
    async (type?: string) => {
      const t = type ?? SCOPED_ATTACKS[Math.floor(Math.random() * SCOPED_ATTACKS.length)];
      try {
        await api.injectAttack(t);
      } catch {
        /* backend offline — ignore; UI stays on last data */
      }
    },
    [],
  );

  const value: LiveContextValue = {
    connected,
    events,
    incidents,
    latestIncident,
    stats,
    injectAttack,
    attackTypes,
  };

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
};

export function useLive(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive must be used within <LiveProvider>");
  return ctx;
}
