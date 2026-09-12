import { Link } from 'react-router-dom';
import {
  ArrowRight, Radar, User, Shield, Server, AlertTriangle, Database,
  Activity, Network, GitMerge, Search, FileText, Zap, Lock, Eye, Code2
} from 'lucide-react';

/* ─── Sub-components ──────────────────────────────────────────────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest uppercase mb-4"
    style={{ color: 'var(--color-signal)' }}
  >
    <span className="w-4 h-px" style={{ backgroundColor: 'var(--color-signal)' }} />
    {children}
  </div>
);

const OrbNode = ({
  icon: Icon,
  label,
  color,
  bg,
  borderColor,
  pulse = false,
  style,
  counterStyle,
}: {
  icon: React.ElementType;
  label?: string;
  color: string;
  bg: string;
  borderColor: string;
  pulse?: boolean;
  style?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
}) => (
  <div className="absolute" style={style}>
    <div style={counterStyle} className="flex flex-col items-center gap-1.5">
      <div className="relative w-11 h-11 rounded-sm border flex items-center justify-center"
        style={{ backgroundColor: bg, borderColor }}>
        {pulse && <span className="absolute inset-0 rounded-sm animate-ping opacity-25" style={{ backgroundColor: color }} />}
        <Icon className="w-4.5 h-4.5 relative z-10" style={{ color }} />
      </div>
      {label && (
        <span className="text-[8px] font-mono tracking-widest uppercase whitespace-nowrap"
          style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
      )}
    </div>
  </div>
);

const PipelineStep = ({ num, icon: Icon, title, desc }: { num: string; icon: React.ElementType; title: string; desc: string }) => (
  <div className="relative flex gap-5">
    <div className="flex flex-col items-center">
      <div className="w-9 h-9 rounded-sm border flex items-center justify-center shrink-0"
        style={{ borderColor: 'var(--color-signal-dim)', backgroundColor: 'rgba(51,214,192,0.08)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--color-signal)' }} />
      </div>
      <div className="w-px flex-1 mt-3" style={{ backgroundColor: 'var(--color-line-soft)', minHeight: 24 }} />
    </div>
    <div className="pb-8">
      <div className="text-[9px] font-mono mb-1" style={{ color: 'var(--color-text-tertiary)' }}>STEP {num}</div>
      <div className="font-mono text-sm font-semibold text-text-primary mb-2">{title}</div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
    </div>
  </div>
);

const UseCaseCard = ({
  severity, icon: Icon, title, pattern, events, entities, desc
}: {
  severity: string; icon: React.ElementType; title: string; pattern: string;
  events: string[]; entities: string[]; desc: string;
}) => {
  const colors: Record<string, string> = {
    Critical: 'var(--color-sev-critical)',
    High: 'var(--color-sev-high)',
    Medium: 'var(--color-sev-medium)',
  };
  const c = colors[severity] ?? 'var(--color-sev-info)';
  return (
    <div className="border flex flex-col" style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-1)', borderLeftColor: c, borderLeftWidth: 3 }}>
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-line-soft)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-sm border flex items-center justify-center" style={{ borderColor: c, backgroundColor: `${c}18` }}>
            <Icon className="w-4 h-4" style={{ color: c }} />
          </div>
          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-sm" style={{ color: c, backgroundColor: `${c}18` }}>
            {severity.toUpperCase()}
          </span>
        </div>
        <div className="font-mono text-sm font-semibold text-text-primary mb-1">{title}</div>
        <div className="text-[10px] font-mono" style={{ color: 'var(--color-signal)' }}>{pattern}</div>
      </div>
      <div className="p-5 flex-1 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
        <div>
          <div className="text-[9px] font-mono mb-2 uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Event Chain</div>
          <div className="flex flex-wrap gap-1.5">
            {events.map((ev, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border"
                style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-line)' }}>
                {ev}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-mono mb-2 uppercase tracking-widest" style={{ color: 'var(--color-text-tertiary)' }}>Shared Entities</div>
          <div className="flex flex-wrap gap-1.5">
            {entities.map((en, i) => (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                style={{ color: 'var(--color-signal)', backgroundColor: 'rgba(51,214,192,0.08)' }}>
                {en}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Landing Page
══════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const O1 = '36s';
  const O2 = '54s';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-ink-0)', color: 'var(--color-text-primary)' }}>

      {/* ── Ambient glow ───────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[180px] opacity-[0.06]"
          style={{ top: '-15%', left: '-10%', backgroundColor: 'var(--color-signal)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.04]"
          style={{ top: '40%', right: '-8%', backgroundColor: 'var(--color-sev-low)' }} />
      </div>

      {/* ─────────────────────────────────────────
          NAVIGATION
      ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-12 h-14 border-b shrink-0 backdrop-blur-sm"
        style={{ borderColor: 'var(--color-line)', backgroundColor: 'rgba(10,15,20,0.92)' }}>

        {/* Logo */}
        <a href="#hero" onClick={scrollTo('hero')} className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center border"
            style={{ borderColor: 'var(--color-signal-dim)', backgroundColor: 'rgba(51,214,192,0.1)' }}>
            <Radar className="w-4 h-4" style={{ color: 'var(--color-signal)' }} />
          </div>
          <div className="leading-none">
            <div className="font-mono text-sm font-semibold tracking-[0.18em]">NEXORA</div>
            <div className="text-[8px] font-mono tracking-widest mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              SEE · CORRELATE · RECONSTRUCT
            </div>
          </div>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {([
            { label: 'Product', id: 'product' },
            { label: 'Use Cases', id: 'use-cases' },
            { label: 'Technology', id: 'technology' },
            { label: 'About', id: 'about' },
          ]).map(({ label, id }) => (
            <a key={id} href={`#${id}`} onClick={scrollTo(id)}
              className="text-xs font-mono tracking-wide transition-colors hover:text-text-primary"
              style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </a>
          ))}
        </nav>

        <Link to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wide px-4 py-2 rounded-sm border transition-colors"
          style={{ borderColor: 'var(--color-signal-dim)', color: 'var(--color-signal)' }}>
          OPEN CONSOLE <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* ─────────────────────────────────────────
          HERO
      ───────────────────────────────────────── */}
      <section id="hero" className="relative z-10 flex flex-col lg:flex-row items-center px-6 sm:px-12 pt-20 pb-24 gap-12 max-w-[1400px] mx-auto w-full">

        {/* Left */}
        <div className="w-full lg:w-[48%]">
          <div className="inline-flex items-center gap-2 mb-6 text-[10px] font-mono font-semibold tracking-widest uppercase"
            style={{ color: 'var(--color-signal)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ backgroundColor: 'var(--color-signal)' }} />
            Real-Time Threat Intelligence
          </div>

          <h1 className="font-mono text-4xl sm:text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.08] mb-6">
            See what<br />
            others <span style={{ color: 'var(--color-signal)' }}>miss.</span>
          </h1>

          <p className="text-base leading-relaxed mb-8 max-w-[440px]" style={{ color: 'var(--color-text-secondary)' }}>
            NEXORA links scattered anomaly alerts into one explainable incident —
            entity graph, matched attack-chain pattern, and full evidence trail
            reconstructed from raw event activity.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Link to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-mono font-semibold tracking-wide px-5 py-3 rounded-sm"
              style={{ backgroundColor: 'var(--color-signal)', color: 'var(--color-ink-0)' }}>
              ENTER DASHBOARD <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#use-cases" onClick={scrollTo('use-cases')}
              className="inline-flex items-center gap-2 text-sm font-mono tracking-wide px-5 py-3 rounded-sm border transition-colors"
              style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-secondary)' }}>
              <Activity className="w-3.5 h-3.5" /> See Use Cases
            </a>
          </div>

          {/* Metric row */}
          <div className="flex gap-8 border-t pt-8" style={{ borderColor: 'var(--color-line-soft)' }}>
            {[
              { val: '< 2s', lbl: 'Correlation latency' },
              { val: '3', lbl: 'Attack scenarios' },
              { val: '100%', lbl: 'Explainable output' },
            ].map(({ val, lbl }) => (
              <div key={lbl}>
                <div className="readout text-2xl font-semibold" style={{ color: 'var(--color-signal)' }}>{val}</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5 uppercase tracking-wider">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — rotating graph */}
        <div className="w-full lg:w-[52%] flex items-center justify-center">
          <div className="relative w-[440px] h-[440px] flex items-center justify-center">

            {/* Centre sphere */}
            <div className="absolute w-[190px] h-[190px] rounded-full z-10 border flex items-center justify-center"
              style={{
                borderColor: 'var(--color-signal-dim)',
                background: 'radial-gradient(circle at 40% 35%, rgba(51,214,192,0.18), rgba(51,214,192,0.03) 70%)',
                boxShadow: '0 0 60px rgba(51,214,192,0.12), inset 0 0 40px rgba(51,214,192,0.05)',
              }}>
              <div className="w-full h-full rounded-full opacity-15"
                style={{ backgroundImage: 'radial-gradient(circle, var(--color-text-tertiary) 1px, transparent 1px)', backgroundSize: '13px 13px' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Radar className="w-6 h-6 mb-1" style={{ color: 'var(--color-signal)' }} />
                <span className="text-[8px] font-mono tracking-widest uppercase" style={{ color: 'var(--color-signal)' }}>NEXORA</span>
              </div>
            </div>

            {/* Ring 1 — 360px CW */}
            <div className="absolute rounded-full border border-dashed"
              style={{ width: 360, height: 360, borderColor: 'rgba(51,214,192,0.18)', animation: `orbit ${O1} linear infinite` }}>
              <OrbNode icon={Network} label="External IP" color="var(--color-sev-low)" bg="rgba(91,141,239,0.1)" borderColor="rgba(91,141,239,0.35)"
                style={{ top: 0, left: '50%', transform: 'translate(-50%,-50%)' }}
                counterStyle={{ animation: `counter-orbit ${O1} linear infinite` }} />
              <OrbNode icon={User} label="User Account" color="var(--color-signal)" bg="rgba(51,214,192,0.08)" borderColor="var(--color-signal-dim)"
                style={{ bottom: '12%', left: '8%', transform: 'translate(-50%,50%)' }}
                counterStyle={{ animation: `counter-orbit ${O1} linear infinite` }} />
              <OrbNode icon={Server} label="API Endpoint" color="var(--color-sev-medium)" bg="rgba(240,201,76,0.08)" borderColor="rgba(240,201,76,0.3)"
                style={{ bottom: '12%', right: '6%', transform: 'translate(50%,50%)' }}
                counterStyle={{ animation: `counter-orbit ${O1} linear infinite` }} />
            </div>

            {/* Ring 2 — 440px CCW */}
            <div className="absolute rounded-full border border-dashed"
              style={{ width: 440, height: 440, borderColor: 'rgba(255,84,112,0.12)', animation: `orbit ${O2} linear infinite reverse` }}>
              <OrbNode icon={AlertTriangle} label="Suspicious Activity" color="var(--color-sev-critical)" bg="rgba(255,84,112,0.1)" borderColor="rgba(255,84,112,0.35)" pulse
                style={{ top: '18%', right: '2%', transform: 'translate(50%,-50%)' }}
                counterStyle={{ animation: `counter-orbit ${O2} linear infinite reverse` }} />
              <OrbNode icon={Database} label="Data Store" color="var(--color-sev-high)" bg="rgba(255,165,61,0.08)" borderColor="rgba(255,165,61,0.3)"
                style={{ bottom: '15%', left: '3%', transform: 'translate(-50%,50%)' }}
                counterStyle={{ animation: `counter-orbit ${O2} linear infinite reverse` }} />
              <OrbNode icon={Shield} label="Endpoint" color="var(--color-signal)" bg="rgba(51,214,192,0.08)" borderColor="var(--color-signal-dim)"
                style={{ top: '6%', left: '10%', transform: 'translate(-50%,-50%)' }}
                counterStyle={{ animation: `counter-orbit ${O2} linear infinite reverse` }} />
            </div>

            {/* Radial spokes SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 440 440">
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                const r = (deg * Math.PI) / 180, cx = 220, cy = 220;
                return <line key={deg} x1={cx + 95 * Math.cos(r)} y1={cy + 95 * Math.sin(r)}
                  x2={cx + 210 * Math.cos(r)} y2={cy + 210 * Math.sin(r)}
                  stroke="var(--color-signal)" strokeWidth="0.5" />;
              })}
            </svg>

            {/* Particles */}
            {[{ t: '14%', l: '20%', s: 4 }, { t: '72%', l: '68%', s: 5 }, { t: '52%', l: '12%', s: 3 }].map((p, i) => (
              <div key={i} className="absolute rounded-full animate-pulse-live"
                style={{ top: p.t, left: p.l, width: p.s, height: p.s, backgroundColor: 'var(--color-signal)', opacity: 0.35 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          PRODUCT
      ───────────────────────────────────────── */}
      <section id="product" className="relative z-10 border-t" style={{ borderColor: 'var(--color-line)' }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: copy */}
            <div>
              <SectionLabel>Product</SectionLabel>
              <h2 className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-6">
                From raw event noise<br />to one explainable incident.
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Security operations centers are overwhelmed with alerts. Most tools surface individual anomalies
                without explaining the connection. Nexora's correlation engine groups related events,
                matches them against known attack patterns, and reconstructs a single, readable incident —
                complete with evidence, entities, and recommended actions.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'No black-box ML — every correlation decision is inspectable',
                  'Shared entity detection across user, IP, session, and endpoint',
                  'Predefined attack-chain pattern library',
                  'Evidence timeline with full event-level detail',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-signal)' }} />
                    {item}
                  </div>
                ))}
              </div>
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wide"
                style={{ color: 'var(--color-signal)' }}>
                Open the dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Right: pipeline */}
            <div className="border p-6" style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-1)' }}>
              <div className="text-[10px] font-mono tracking-widest uppercase mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                Processing pipeline
              </div>
              <PipelineStep num="01" icon={Activity} title="Event Ingestion"
                desc="Security events stream in — login failures, API calls, database queries, file access, network activity, and port scans." />
              <PipelineStep num="02" icon={Search} title="Anomaly Scoring"
                desc="Each event is scored against baseline behaviour. Scores above threshold surface as suspicious activity in the live feed." />
              <PipelineStep num="03" icon={GitMerge} title="Entity Correlation"
                desc="The engine groups events that share the same user, IP, or session identifier within a configured temporal window." />
              <PipelineStep num="04" icon={Eye} title="Pattern Matching"
                desc="Grouped events are checked against the predefined attack-chain library — Brute Force, Credential Stuffing, Exfiltration, Reconnaissance." />
              <div className="flex gap-5">
                <div className="w-9 shrink-0" />
                <div className="pb-2">
                  <div className="text-[9px] font-mono mb-1" style={{ color: 'var(--color-text-tertiary)' }}>STEP 05</div>
                  <div className="font-mono text-sm font-semibold text-text-primary mb-2">Incident Reconstruction</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    A single incident record is created with severity, confidence, evidence timeline,
                    correlation explanation, and recommended response actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          USE CASES
      ───────────────────────────────────────── */}
      <section id="use-cases" className="relative z-10 border-t" style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-1)' }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20">
          <SectionLabel>Use Cases</SectionLabel>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <h2 className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Attack scenarios<br />Nexora detects.
            </h2>
            <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Each scenario is injected live in the demo dashboard, producing a fully correlated incident you can inspect end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-line)]">
            <UseCaseCard
              severity="Critical"
              icon={Lock}
              title="Credential Stuffing → Data Exfiltration"
              pattern="credential_compromise_exfiltration"
              desc="A burst of authentication failures from a single IP is followed by a successful login and immediate bulk data transfer. Nexora correlates the failed and successful auth events with the subsequent database query and exfiltration — all under the same user and IP."
              events={['auth_login_failure ×3', 'auth_login_success', 'db_query', 'file_access', 'data_exfiltration']}
              entities={['User: j.patel', 'IP: 203.0.113.14', 'Session: sess-a1']}
            />
            <UseCaseCard
              severity="High"
              icon={Network}
              title="Port Scan / Reconnaissance"
              pattern="port_scan_detected"
              desc="Sequential port probes from an external IP over a short window indicate reconnaissance activity. Nexora groups the scan events by shared source IP and flags the escalating volume as a precursor to a targeted attack."
              events={['port_scan ×2+']}
              entities={['IP: 192.0.2.88', 'Session: sess-scan1']}
            />
            <UseCaseCard
              severity="High"
              icon={Zap}
              title="Brute Force Attack"
              pattern="brute_force_attack"
              desc="Automated rapid-fire credential attempts targeting multiple privileged accounts (admin, root, administrator) in under 10 seconds. Nexora detects the pattern by correlating the common source IP, short time window, and account enumeration behaviour."
              events={['auth_login_failure ×3', 'brute_force_attempt']}
              entities={['IP: 203.0.113.99', 'Accounts: admin, root']}
            />
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link to="/incidents"
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wide px-4 py-2 rounded-sm border"
              style={{ borderColor: 'var(--color-signal-dim)', color: 'var(--color-signal)' }}>
              View all incidents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/live"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wide px-4 py-2 rounded-sm border"
              style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-secondary)' }}>
              <Activity className="w-3.5 h-3.5" /> Live event stream
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          TECHNOLOGY
      ───────────────────────────────────────── */}
      <section id="technology" className="relative z-10 border-t" style={{ borderColor: 'var(--color-line)' }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20">
          <SectionLabel>Technology</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-6">
                Deterministic correlation,<br />not a black box.
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                The Nexora correlation engine is explainable and deterministic. Every linkage decision is made
                by evaluating three criteria: shared entities, temporal proximity, and pattern matching against
                a predefined attack-chain library. There are no hidden weights, no learned causal inference,
                and no opaque model outputs.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: User,
                    title: 'Shared Entity Detection',
                    body: 'Events are grouped when they share at least one common entity — user account, source IP, or session ID. Entity overlap is the primary correlation signal.',
                  },
                  {
                    icon: Activity,
                    title: 'Temporal Proximity',
                    body: 'Grouped events must fall within a configured time window (typically seconds to minutes) to be considered part of the same attack sequence.',
                  },
                  {
                    icon: GitMerge,
                    title: 'Attack-Chain Pattern Matching',
                    body: 'Grouped events are matched against the pattern library. A match elevates severity and labels the incident with the identified attack type.',
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-sm border flex items-center justify-center shrink-0 mt-0.5"
                      style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-1)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-signal)' }} />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-semibold text-text-primary mb-1">{title}</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engine Visualization */}
            <div className="relative border p-8 overflow-hidden rounded-sm bg-ink-2" style={{ borderColor: 'var(--color-line-strong)' }}>
              {/* Animated background lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--color-signal) 1px, transparent 1px), linear-gradient(90deg, var(--color-signal) 1px, transparent 1px)', backgroundSize: '24px 24px', backgroundPosition: 'center center' }} />
              
              <div className="relative z-10 space-y-6">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-ink-1" style={{ borderColor: 'var(--color-text-tertiary)' }}>
                      <Activity className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                    <div className="w-0.5 h-6 my-1" style={{ backgroundColor: 'var(--color-line-strong)' }} />
                  </div>
                  <div className="flex-1 bg-ink-1 border p-3 rounded-sm" style={{ borderColor: 'var(--color-line)' }}>
                    <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Ingestion</div>
                    <div className="text-sm font-semibold text-text-primary">Raw Security Events</div>
                  </div>
                </div>

                {/* Step 2 (Active) */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center relative shadow-lg" style={{ borderColor: 'var(--color-signal)', backgroundColor: 'rgba(51,214,192,0.1)' }}>
                      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: 'var(--color-signal)' }} />
                      <Database className="w-4 h-4" style={{ color: 'var(--color-signal)' }} />
                    </div>
                    <div className="w-0.5 h-6 my-1 relative overflow-hidden" style={{ backgroundColor: 'var(--color-line-strong)' }}>
                      <div className="absolute top-0 left-0 w-full h-full animate-[translate-y-full_2s_linear_infinite]" style={{ background: 'linear-gradient(to bottom, transparent, var(--color-signal), transparent)' }} />
                    </div>
                  </div>
                  <div className="flex-1 border p-3 rounded-sm shadow-lg relative overflow-hidden" style={{ borderColor: 'var(--color-signal-dim)', backgroundColor: 'var(--color-ink-1)' }}>
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: 'var(--color-signal)' }} />
                    <div className="text-[10px] font-mono tracking-widest uppercase mb-1 pl-1" style={{ color: 'var(--color-signal)' }}>Processing</div>
                    <div className="text-sm font-semibold text-text-primary pl-1">Deterministic Correlation Engine</div>
                    <div className="text-xs mt-1 pl-1" style={{ color: 'var(--color-text-tertiary)' }}>Applying 3-factor criteria matching</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-ink-1" style={{ borderColor: 'var(--color-sev-high)' }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-sev-high)' }} />
                    </div>
                  </div>
                  <div className="flex-1 bg-ink-1 border p-3 rounded-sm" style={{ borderColor: 'var(--color-line)' }}>
                    <div className="text-[10px] font-mono tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-tertiary)' }}>Output</div>
                    <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      Reconstructed Incident <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-opacity-20 uppercase font-mono tracking-wide" style={{ backgroundColor: 'rgba(255,165,61,0.2)', color: 'var(--color-sev-high)' }}>High Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          ABOUT
      ───────────────────────────────────────── */}
      <section id="about" className="relative z-10 border-t" style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-1)' }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-20">
          <SectionLabel>About</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-6">
                Built for modern<br />security operations.
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Nexora is an AI-Powered Security Event Correlation and Incident Reconstruction Platform
                designed to address the alert-fatigue problem in modern security operations. We replace
                noisy, disparate alerts with high-confidence, explainable incidents.
              </p>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Equipping SOC analysts with a powerful operations console, Nexora provides real-time
                visibility into emerging threats, autonomous correlation of malicious activity, and
                instant access to the forensic evidence needed for rapid response.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://github.com/MohdNoman07/Nexora" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono tracking-wide px-4 py-2 rounded-sm border transition-colors"
                  style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-secondary)' }}>
                  <Code2 className="w-3.5 h-3.5" /> View Source on GitHub
                </a>
                <Link to="/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wide px-4 py-2 rounded-sm"
                  style={{ backgroundColor: 'var(--color-signal)', color: 'var(--color-ink-0)' }}>
                  Open Console <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Project scope card */}
            <div className="border" style={{ borderColor: 'var(--color-line)', backgroundColor: 'var(--color-ink-2)' }}>
              <div className="px-5 py-4 border-b text-[10px] font-mono tracking-widest uppercase"
                style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-tertiary)' }}>
                Core capabilities
              </div>
              <div className="p-5 space-y-4">
                {[
                  { icon: Eye, title: 'Detection', desc: 'Anomaly scoring on incoming security events — login patterns, API burst, scan volume, data transfer.' },
                  { icon: GitMerge, title: 'Correlation', desc: 'Deterministic grouping by shared entities, temporal window, and attack-chain pattern matching.' },
                  { icon: FileText, title: 'Reconstruction', desc: 'Single explainable incident: severity, confidence, evidence timeline, recommended response.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                    style={{ borderColor: 'var(--color-line-soft)' }}>
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-signal)' }} />
                    <div>
                      <div className="font-mono text-sm font-semibold text-text-primary mb-1">{title}</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t" style={{ borderColor: 'var(--color-line)', backgroundColor: 'rgba(10,15,20,0.95)' }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 h-12 flex items-center justify-between">
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
            NEXORA — AI-Powered Security Event Correlation Platform
          </span>
          <Link to="/dashboard" className="text-[10px] font-mono flex items-center gap-1.5"
            style={{ color: 'var(--color-signal)' }}>
            ENTER CONSOLE <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
