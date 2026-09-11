import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { ACTIVE_THREATS, generateEvents } from '../data/mockData';

interface SpotlightSearchProps {
  open: boolean;
  onClose: () => void;
}

const ALL_ITEMS = [
  ...generateEvents().map((e) => ({ id: e.id, label: e.label, sub: e.endpoint ?? '', tag: 'event', color: '#4f8ef7' })),
  ...ACTIVE_THREATS.map((t) => ({ id: t.id, label: t.title, sub: t.endpoint, tag: 'threat', color: '#ff4d4d' })),
  { id: 'nav-overview',     label: 'Overview',          sub: 'Main dashboard', tag: 'page',   color: '#22d3ee' },
  { id: 'nav-live',         label: 'Live Events',        sub: 'Real-time feed', tag: 'page',   color: '#22d3ee' },
  { id: 'nav-correlation',  label: 'Correlation',        sub: 'Graph view',     tag: 'page',   color: '#22d3ee' },
  { id: 'nav-incidents',    label: 'Incidents',          sub: 'Active cases',   tag: 'page',   color: '#22d3ee' },
  { id: 'ip-1',             label: '185.42.91.8',        sub: 'Malicious IP',   tag: 'ip',     color: '#ff4d4d' },
  { id: 'ip-2',             label: '91.203.18.44',       sub: 'Tor exit node',  tag: 'ip',     color: '#f59e0b' },
];

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? ALL_ITEMS.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.sub.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ITEMS.slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1));
    if (e.key === 'ArrowUp')   setSelected((s) => Math.max(s - 1, 0));
    if (e.key === 'Enter') { onClose(); }
  }, [open, filtered.length, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 z-50 w-full max-w-xl glass-strong rounded-2xl overflow-hidden shadow-2xl"
            style={{ transform: 'translateX(-50%)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Search size={16} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search events, IPs, threats, pages..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
                </button>
              )}
              <kbd
                className="px-2 py-1 rounded text-[10px] font-mono"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-2 max-h-80 overflow-y-auto" data-lenis-prevent>
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No results for "{query}"
                </div>
              ) : (
                filtered.map((item, i) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: i === selected ? 'rgba(79,142,247,0.1)' : 'transparent',
                      borderLeft: i === selected ? '2px solid #4f8ef7' : '2px solid transparent',
                    }}
                    onMouseEnter={() => setSelected(i)}
                    onClick={onClose}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{item.label}</div>
                      <div className="text-[11px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {item.sub}
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
                    >
                      {item.tag}
                    </span>
                    {i === selected && <ArrowRight size={12} style={{ color: '#4f8ef7' }} />}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2.5 flex items-center gap-4 text-[10px] font-mono"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}
            >
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
