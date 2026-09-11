# Nexora — Incident Reconstruction Console (frontend)

Zero-dependency frontend for the AI-Powered Security Monitoring & Incident Reconstruction Platform.
Three files, no build step: `index.html`, `styles.css`, `app.js`.

## Run

```bash
cd nexora
python3 -m http.server 5173
# open http://localhost:5173
```

Or just double-click `index.html`.

## What's in it

- **Liquid-glass shell** — clear glass navbar with a springy pill highlight that stretches to whatever you hover, blurred/saturated surfaces with inner specular highlights, drifting aurora background.
- **Entity surface (canvas)** — the organization (`ACME-NET`) sits at the centre; the 10 entities from your event schema (auth, VPN, API gateway, Postgres, file store, endpoints, edge, mail) orbit it in pseudo-3D with perspective scaling and pointer parallax. Green packets = benign flow, red glowing packets/edges = flagged attack path. Hover a node for its risk tooltip, click to pin it in the entity panel.
- **Live activity feed** — simulated WebSocket stream on the unified event schema, with events/sec sparkline, anomaly counter and a pause control in the navbar.
- **Attack injection** — Brute force, Port scan, Data exfiltration. Each one lights the real attack path on the graph, streams flagged events, and assembles the incident **stage by stage** (that's the §6 correlation engine, visualised).
- **Incident reconstruction** — 4-stage chain + evidence list with per-signal scores and `link` markers where events were joined by shared entity, severity ring, and a lookup-table recommended response (exactly the scope in §7).
- **Benchmark section** — per-class precision/recall/F1 framed as CICIDS2017 results, plus FPR / detection latency / correlation accuracy from §10.

## Wiring it to FastAPI

Everything fake lives in three places in `app.js`:

1. `ENTITIES` — replace with `GET /entities`.
2. `tickBenign()` / `pushEvent()` — replace the interval with a WebSocket handler:
   ```js
   const ws = new WebSocket('ws://localhost:8000/ws/events')
   ws.onmessage = e => {
     const ev = JSON.parse(e.data)               // {src, type, detail, flag, score}
     pushEvent(ev)
     const edge = edges.find(x => x.a === ev.src || x.b === ev.src)
     if (edge) spawnPacket(edge, ev.flag)
   }
   ```
3. `PLAYBOOK` — replace with the correlation engine's incident payload: `{name, action, path[], focus, stages[], evidence[], severity}`. `runAttack()` already renders whatever shape you hand it, so a real incident from `/incidents/{id}` drops straight in.

The injector buttons should become `POST /simulate/attack/{type}` — the UI then just waits for the incident to arrive over the socket instead of driving itself.

## Notes

- Numbers in the benchmark section are placeholders for the mock — swap them for your actual CICIDS2017 run before the viva.
- Respects `prefers-reduced-motion`; responsive down to 390px.
