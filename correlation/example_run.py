"""
Sanity check: feed the correlation module a synthetic credential-compromise
attack chain and confirm it gets correctly reconstructed as one incident.

Run with: python example_run.py
"""

from datetime import datetime, timedelta
from graph_builder import EventGraph
from matcher import run_all_templates


def make_event(event_id, event_type, offset_seconds, user="alice", **kwargs):
    return {
        "id": event_id,
        "event_type": event_type,
        "timestamp": datetime(2026, 1, 1, 10, 0, 0) + timedelta(seconds=offset_seconds),
        "user": user,
        **kwargs,
    }


events = []
# 5 failed logins across ~80 seconds
for i in range(5):
    events.append(make_event(f"fail_{i}", "auth_failure", offset_seconds=i * 20))
# successful login shortly after
events.append(make_event("success_1", "auth_success", offset_seconds=110))
# privileged resource access
events.append(make_event("priv_1", "privileged_resource_access", offset_seconds=160))
# large data transfer
events.append(make_event("transfer_1", "large_data_transfer", offset_seconds=250))

graph = EventGraph()
for e in events:
    graph.add_event(e)

# in the real pipeline, only anomalous/classified events would be "flagged" --
# here we pretend all of them were, since this is just testing the matcher
flagged_ids = [e["id"] for e in events]

incidents = run_all_templates(graph, flagged_ids)

print(f"Found {len(incidents)} incident(s):\n")
for incident in incidents:
    print(f"  Template:   {incident['template_name']}")
    print(f"  Entity:     {incident['entity']}")
    print(f"  Events:     {incident['matched_events']}")
    print(f"  Time span:  {incident['start_time']} -> {incident['end_time']}")
    print()
