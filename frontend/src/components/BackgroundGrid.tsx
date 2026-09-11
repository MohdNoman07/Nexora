import React from 'react';

export const BackgroundGrid: React.FC = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0"
    style={{
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(79,142,247,0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(167,139,250,0.04) 0%, transparent 40%),
        radial-gradient(circle at 60% 80%, rgba(255,77,77,0.03) 0%, transparent 40%),
        radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px',
    }}
  />
);
