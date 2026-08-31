"""
Week 2 integration check: feed the correlation engine REAL output from
P2's simulator (not hand-crafted mocks) and confirm two things:

1. Normal traffic alone produces ZERO incidents (a false-positive check --
   worth keeping around, this is exactly the kind of number your report's
   evaluation section needs later).
2. A hand-crafted attack sequence, in the *real* schema shape, still gets
   correctly reconstructed into one incident.

Run from the correlation/ folder: python integration_check.py

NOTE on imports: p2-pipeline has a hyphen in its folder name, so
`import p2-pipeline.simulator` is invalid Python. Instead we add the
p2-pipeline folder itself to sys.path and import `simulator` directly --
see the sys.path line below. Adjust the relative path if you run this
from somewhere other than the correlation/ folder.
"""

import sys
import uuid
from datetime import timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
P2_PIPELINE = REPO_ROOT / "p2-pipeline"

sys.path.insert(0, str(P2_PIPELINE))
from simulator.generator import NormalTrafficGenerator  # noqa: E402

from graph_builder import EventGraph  # noqa: E402
from matcher import run_all_templates  # noqa: E402


def to_dict_with_id(event) -> dict:
    """P2's Event dataclass has no 'id' field -- the correlation graph needs
    one, so we assign it here rather than asking P2 to change their schema
    for our convenience."""
    d = {
        "id": uuid.uuid4().hex[:8],
        "event_type": event.event_type,
        "timestamp": event.timestamp,
        "user": event.user,
        "ip": event.ip,
        "session": event.session,
        "severity": event.severity,
        "metadata": event.metadata,
    }
    return d


# --- Check 1: normal traffic should produce zero incidents ----------------

gen = NormalTrafficGenerator(seed=7)
normal_events = [to_dict_with_id(e) for e in gen.stream_sessions(30)]

graph = EventGraph()
for e in normal_events:
    graph.add_event(e)

all_ids = [e["id"] for e in normal_events]
incidents = run_all_templates(graph, all_ids)

print(f"Normal traffic ({len(normal_events)} events, real simulator output): "
      f"{len(incidents)} incident(s) found.")
print("Expected: 0. If this isn't 0, something in the templates is too loose.\n")


# --- Check 2: a hand-crafted attack chain, real schema shape --------------

def make_event(event_id, event_type, offset_seconds, user="alice", ip="10.0.0.5",
               session="sess-test", metadata=None):
    from datetime import datetime, timezone
    ts = datetime(2026, 1, 1, 10, 0, 0, tzinfo=timezone.utc) + timedelta(seconds=offset_seconds)
    return {
        "id": event_id,
        "event_type": event_type,
        "timestamp": ts,
        "user": user,
        "ip": ip,
        "session": session,
        "severity": 0.8,
        "metadata": metadata or {},
    }


attack_events = []
for i in range(5):
    attack_events.append(make_event(f"fail_{i}", "auth_login_failure", offset_seconds=i * 20))
attack_events.append(make_event("success_1", "auth_login_success", offset_seconds=110))
attack_events.append(make_event("dbq_1", "db_query", offset_seconds=160))
attack_events.append(make_event("file_1", "file_access", offset_seconds=250,
                                 metadata={"action": "download"}))

attack_graph = EventGraph()
for e in attack_events:
    attack_graph.add_event(e)

attack_ids = [e["id"] for e in attack_events]
attack_incidents = run_all_templates(attack_graph, attack_ids)

print(f"Hand-crafted attack chain: {len(attack_incidents)} incident(s) found.")
for incident in attack_incidents:
    print(f"  -> {incident['template_name']}, entity={incident['entity']}, "
          f"events={incident['matched_events']}")
