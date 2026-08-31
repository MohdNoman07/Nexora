"""
Attack-chain templates for the correlation engine.

WEEK 2 FIX: the Week 1 version of this file used invented field/event_type
names that didn't match the canonical schema at
p2-pipeline/schema/event_schema.json. Corrected below -- see the repo
comparison for what was wrong (ip vs source_ip, and event_type naming).

TWO TEMPLATES BELOW ARE BLOCKED pending a team decision -- do not build
against them until the sync resolves the open question in their comments.
"""

from dataclasses import dataclass, field
from typing import Callable, List, Optional


@dataclass
class TemplateStep:
    event_type: str
    max_gap_seconds: int
    min_count: int = 1
    # Optional extra check on the event dict, beyond just its type -- e.g.
    # "only a file_access that's a download, not a read." Added in Week 2
    # after the integration check below turned up false positives on plain
    # read-only normal sessions.
    event_filter: Optional[Callable[[dict], bool]] = None


@dataclass
class AttackTemplate:
    name: str
    description: str
    steps: List[TemplateStep]
    link_by: List[str]
    window_seconds: int


# 1. Credential compromise -> exfiltration
# Uses only primitive event types the simulator actually emits (per schema).
# "Privileged access" / "large transfer" are approximated with db_query /
# file_access for now. Once P1's anomaly_score is wired in, tighten this to
# only count HIGH-severity db_query/file_access events -- for now, every
# event passed in is assumed already "flagged" upstream.
CREDENTIAL_COMPROMISE = AttackTemplate(
    name="credential_compromise_exfiltration",
    description=(
        "Burst of failed logins, a successful login, then database and file "
        "access -- all tied to the same user."
    ),
    steps=[
        TemplateStep(event_type="auth_login_failure", max_gap_seconds=120, min_count=5),
        TemplateStep(event_type="auth_login_success", max_gap_seconds=60),
        TemplateStep(event_type="db_query", max_gap_seconds=120),
        TemplateStep(
            event_type="file_access", max_gap_seconds=180,
            event_filter=lambda e: e.get("metadata", {}).get("action") == "download",
        ),
    ],
    link_by=["user"],
    window_seconds=600,
)

# 2. Data exfiltration without a brute-force precursor
DATA_EXFILTRATION = AttackTemplate(
    name="data_exfiltration",
    description="Normal login followed by a database query and a file access, same session.",
    steps=[
        TemplateStep(event_type="auth_login_success", max_gap_seconds=0),
        TemplateStep(event_type="db_query", max_gap_seconds=300),
        TemplateStep(
            event_type="file_access", max_gap_seconds=180,
            event_filter=lambda e: e.get("metadata", {}).get("action") == "download",
        ),
    ],
    link_by=["user", "session"],
    window_seconds=600,
)

# 3. Port scan -- NEEDS TEAM DECISION, not built yet.
# The schema lists "port_scan" as a valid event_type, but there is no
# primitive event type (e.g. "connection_attempt") for individual connection
# probes to chain together the way credential_compromise chains auth events.
# Raise in your next sync:
#   (a) add a primitive network-event type to the schema -- this template
#       becomes "many connection_attempt events, same ip, short window", or
#   (b) the injector emits a single atomic "port_scan" event directly, in
#       which case there's no chain here for the correlation engine to
#       build -- it's a pass-through flagged event, not a template match.
# Whichever P2 (schema owner) and P1 (classifier) agree on changes what
# this module needs to do, so don't guess -- ask them directly.

# 4. Privilege escalation -- same open question as port_scan above.
# Is this a primitive event type the injector emits directly, or a pattern
# over existing primitives (e.g. an api_call to an admin-only endpoint)?
# Raise alongside the port_scan question -- same root cause, one sync item.

ALL_TEMPLATES = [CREDENTIAL_COMPROMISE, DATA_EXFILTRATION]
