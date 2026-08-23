"""
Normal traffic generator — Week 1 sketch.

Goal for this week: prove that we can emit events matching the agreed
schema (schema/event_schema.json), nothing more. Full auth/API/DB/file
event coverage, configurable rates, and attack injection come in Week 2+.

Run directly to print a few sample events and sanity-check the schema:
    python -m simulator.generator
"""

from __future__ import annotations

import json
import random
import string
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Iterator


# --- Config -----------------------------------------------------------
# Kept intentionally small this week. Expand as more event types land.

USERS = ["alice", "bob", "carol", "dave", "svc_billing", "svc_reports"]

# Rough proportion of each event type in "normal" traffic.
# Only two types implemented for the Week 1 sketch.
EVENT_WEIGHTS = {
    "auth_login_success": 0.3,
    "api_call": 0.7,
}

API_ENDPOINTS = ["/api/orders", "/api/users", "/api/reports", "/api/invoices"]


# --- Data model ---------------------------------------------------------

@dataclass
class Event:
    event_type: str
    timestamp: str
    user: str
    ip: str
    session: str
    severity: float
    metadata: dict

    def to_json(self) -> str:
        return json.dumps(asdict(self))


# --- Helpers --------------------------------------------------------------

def _random_ip() -> str:
    # Biased toward a small internal-looking range so traffic looks
    # like it's coming from a real office/VPN pool, not fully random noise.
    return f"10.0.{random.randint(0, 5)}.{random.randint(2, 254)}"


def _random_session() -> str:
    return uuid.uuid4().hex[:12]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _pick_event_type() -> str:
    types, weights = zip(*EVENT_WEIGHTS.items())
    return random.choices(types, weights=weights, k=1)[0]


# --- Generator ------------------------------------------------------------

class NormalTrafficGenerator:
    """
    Emits schema-compliant 'normal' (non-attack) events.

    This is deliberately minimal for Week 1: one session per emitted
    event, two event types, no timing/burst control yet. Week 2 adds
    auth/API/DB/file coverage and session continuity (same session ID
    reused across a short sequence of events, like a real user session).
    """

    def __init__(self, seed: int | None = None):
        if seed is not None:
            random.seed(seed)

    def _make_event(self) -> Event:
        event_type = _pick_event_type()
        user = random.choice(USERS)
        ip = _random_ip()
        session = _random_session()

        if event_type == "auth_login_success":
            metadata = {"method": random.choice(["password", "sso"])}
            severity = 0.0
        elif event_type == "api_call":
            metadata = {
                "endpoint": random.choice(API_ENDPOINTS),
                "method": random.choice(["GET", "POST"]),
                "status_code": random.choice([200, 200, 200, 201, 204]),
            }
            severity = 0.0
        else:
            raise ValueError(f"Unhandled event_type in Week 1 sketch: {event_type}")

        return Event(
            event_type=event_type,
            timestamp=_now_iso(),
            user=user,
            ip=ip,
            session=session,
            severity=severity,
            metadata=metadata,
        )

    def stream(self, n: int) -> Iterator[Event]:
        """Yield n schema-compliant normal events."""
        for _ in range(n):
            yield self._make_event()


# --- Manual sanity check ---------------------------------------------------

if __name__ == "__main__":
    gen = NormalTrafficGenerator(seed=42)
    print("Sample of 5 schema-compliant normal events:\n")
    for event in gen.stream(5):
        print(event.to_json())
