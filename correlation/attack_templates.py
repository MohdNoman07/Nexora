"""
Attack-chain templates for the correlation engine.

Each template describes an ORDERED sequence of event types that, if observed
linked by a shared entity (user / ip / session) within a time window,
constitutes a specific attack pattern.

This is a hybrid graph-linking + pattern-matching design (not a learned model) --
see the project plan doc, section 6, for why that's the right scope for this project.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class TemplateStep:
    event_type: str        # must match an event_type in your event schema
    max_gap_seconds: int    # max time allowed since the previous relevant event
    min_count: int = 1      # e.g. auth_failure might need min_count=5 to count as a "burst"


@dataclass
class AttackTemplate:
    name: str
    description: str
    steps: List[TemplateStep]
    link_by: List[str]      # entity fields that must match across every step, e.g. ["user"]
    window_seconds: int     # total time allowed for the whole chain to complete


# 1. Credential compromise -> exfiltration
CREDENTIAL_COMPROMISE = AttackTemplate(
    name="credential_compromise_exfiltration",
    description=(
        "Burst of failed logins, followed by a successful login, a privileged "
        "resource access, and a large data transfer -- all tied to the same user."
    ),
    steps=[
        TemplateStep(event_type="auth_failure", max_gap_seconds=120, min_count=5),
        TemplateStep(event_type="auth_success", max_gap_seconds=60),
        TemplateStep(event_type="privileged_resource_access", max_gap_seconds=120),
        TemplateStep(event_type="large_data_transfer", max_gap_seconds=180),
    ],
    link_by=["user"],
    window_seconds=600,
)

# 2. Port scan
PORT_SCAN = AttackTemplate(
    name="port_scan",
    description="Many distinct connection attempts from the same source IP in a short window.",
    steps=[
        TemplateStep(event_type="connection_attempt", max_gap_seconds=30, min_count=15),
    ],
    link_by=["source_ip"],
    window_seconds=120,
)

# 3. Data exfiltration (no brute-force precursor -- e.g. an already-compromised or insider session)
DATA_EXFILTRATION = AttackTemplate(
    name="data_exfiltration",
    description="Normal login followed by an unusually large DB query and a large outbound transfer.",
    steps=[
        TemplateStep(event_type="auth_success", max_gap_seconds=0),
        TemplateStep(event_type="large_db_query", max_gap_seconds=300),
        TemplateStep(event_type="large_data_transfer", max_gap_seconds=180),
    ],
    link_by=["user", "session"],
    window_seconds=600,
)

# 4. Optional -- API burst / rate abuse
API_BURST = AttackTemplate(
    name="api_rate_abuse",
    description="Sudden spike in API request rate from the same user/key relative to baseline.",
    steps=[
        TemplateStep(event_type="api_request", max_gap_seconds=5, min_count=50),
    ],
    link_by=["user", "api_key"],
    window_seconds=60,
)

ALL_TEMPLATES = [CREDENTIAL_COMPROMISE, PORT_SCAN, DATA_EXFILTRATION, API_BURST]
