import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CorrelationGraph } from '../../components/CorrelationGraph';
import { ACTIVE_THREATS } from '../../data/mockData';
import { Filter, Globe, User, Zap, Server, Database } from 'lucide-react';

const FILTER_TYPES = [
  { name: 'All Entities', icon: Globe },
  { name: 'IP Addresses', icon: Globe },
  { name: 'Users', icon: User },
  { name: 'APIs', icon: Zap },
  { name: 'Servers', icon: Server },
  { name: 'Databases', icon: Database },
];

const CorrelationPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Entities');

  return (
    <div className="px-8 py-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Threat Intelligence & Graph Analysis
          </span>
          <h1 className="text-3xl font-serif italic text-slate-900 font-normal mt-1">
            Event Correlation Topology
          </h1>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Real-time visual map linking ingress vectors, compromised credentials, target API endpoints, and sensitive database assets across active attack chains.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 text-xs shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-semibold text-slate-700">3 Active Correlations</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
          <Filter size={12} /> Entity Filter:
        </span>
        {FILTER_TYPES.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.name;
          return (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white/80 text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Icon size={12} />
              {filter.name}
            </button>
          );
        })}
      </div>

      {/* Main Centerpiece Correlation Graph */}
      <CorrelationGraph />

      {/* Active Correlated Threat Cards */}
      <div>
        <div className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Active Threat Clusters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ACTIVE_THREATS.map((threat) => (
            <motion.div
              key={threat.id}
              whileHover={{ y: -2 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${
                    threat.severity === 'critical'
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : threat.severity === 'high'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {threat.severity}
                </span>
                <span className="font-mono text-xs font-semibold text-rose-600">
                  {threat.confidence}% confidence
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{threat.title}</h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">{threat.endpoint}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-100">
                <span>Chain: {threat.attackChain}</span>
                <span>First seen: {threat.firstSeen}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorrelationPage;
