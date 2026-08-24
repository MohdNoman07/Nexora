"""
Builds an entity-linked event graph: events are nodes, and edges connect
events that share an entity (user, source_ip, session) within a sliding
time window. This is the structure the template matcher (matcher.py)
walks to find attack chains.
"""

import networkx as nx
from datetime import timedelta

LINK_FIELDS = ["user", "source_ip", "session"]
DEFAULT_WINDOW = timedelta(minutes=10)


class EventGraph:
    def __init__(self, window: timedelta = DEFAULT_WINDOW):
        self.graph = nx.DiGraph()
        self.window = window

    def add_event(self, event: dict):
        """
        event must contain at least: id, event_type, timestamp (datetime),
        plus whichever entity fields it has (user / source_ip / session).
        """
        self.graph.add_node(event["id"], **event)
        self._link_related_events(event)

    def _link_related_events(self, event: dict):
        event_time = event["timestamp"]
        for node_id, data in list(self.graph.nodes(data=True)):
            if node_id == event["id"]:
                continue
            if abs(event_time - data["timestamp"]) > self.window:
                continue
            shared_fields = [
                f for f in LINK_FIELDS
                if f in event and f in data and event[f] == data[f]
            ]
            if shared_fields:
                # directed edge: earlier event -> later event
                if data["timestamp"] <= event_time:
                    self.graph.add_edge(node_id, event["id"], shared=shared_fields)
                else:
                    self.graph.add_edge(event["id"], node_id, shared=shared_fields)

    def get_entity_events(self, entity_field: str, entity_value):
        """All events tied to one entity value (e.g. one specific user), sorted by time."""
        events = [
            data for _, data in self.graph.nodes(data=True)
            if data.get(entity_field) == entity_value
        ]
        return sorted(events, key=lambda e: e["timestamp"])
