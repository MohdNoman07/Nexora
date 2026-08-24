"""
Matches attack-chain templates against sequences of flagged events in the
event graph. This is a deliberately simple, greedy sequential matcher --
not a general subgraph-isomorphism solver -- which is the right level of
complexity for this project and is easy to explain in a viva.

Known simplification (fine for a Week 1 scaffold, revisit in Week 3-4):
if two templates could plausibly overlap on the same events, this matcher
doesn't do backtracking to try alternate groupings. For your 3-4 templates,
that's not expected to matter, but worth a mention in your report if you
run into it during testing.
"""

from datetime import timedelta
from attack_templates import AttackTemplate, ALL_TEMPLATES


def match_template(graph, template: AttackTemplate, flagged_event_ids):
    matches = []
    flagged_events = [graph.graph.nodes[eid] for eid in flagged_event_ids]
    flagged_events.sort(key=lambda e: e["timestamp"])

    # group flagged events by the entity value(s) the template links on
    groups = {}
    for e in flagged_events:
        key = tuple(e.get(f) for f in template.link_by)
        if None in key:
            continue  # event doesn't have all the fields this template needs
        groups.setdefault(key, []).append(e)

    for key, events in groups.items():
        step_idx = 0
        step_matches = []
        matched_steps = []
        last_event_time = None

        for e in events:
            if step_idx >= len(template.steps):
                break
            step = template.steps[step_idx]

            if e["event_type"] != step.event_type:
                continue

            if last_event_time is not None and (
                e["timestamp"] - last_event_time > timedelta(seconds=step.max_gap_seconds)
            ):
                step_matches = []  # gap too large, restart progress on this step

            step_matches.append(e)
            last_event_time = e["timestamp"]

            if len(step_matches) >= step.min_count:
                matched_steps.append(step_matches)
                step_idx += 1
                step_matches = []

        if step_idx == len(template.steps):
            all_matched = [e for group in matched_steps for e in group]
            span = all_matched[-1]["timestamp"] - all_matched[0]["timestamp"]
            if span <= timedelta(seconds=template.window_seconds):
                matches.append({
                    "template_name": template.name,
                    "description": template.description,
                    "matched_events": [e["id"] for e in all_matched],
                    "entity": dict(zip(template.link_by, key)),
                    "start_time": all_matched[0]["timestamp"],
                    "end_time": all_matched[-1]["timestamp"],
                })

    return matches


def run_all_templates(graph, flagged_event_ids):
    incidents = []
    for template in ALL_TEMPLATES:
        incidents.extend(match_template(graph, template, flagged_event_ids))
    return incidents
