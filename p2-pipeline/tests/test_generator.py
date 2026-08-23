"""
Sanity test: generator output must always match the team's schema contract.
Run with: pytest tests/test_generator.py -v
"""

import json
from pathlib import Path

import jsonschema
import pytest

from simulator.generator import NormalTrafficGenerator

SCHEMA_PATH = Path(__file__).parent.parent / "schema" / "event_schema.json"


@pytest.fixture(scope="module")
def schema():
    with open(SCHEMA_PATH) as f:
        return json.load(f)


def test_generated_events_match_schema(schema):
    gen = NormalTrafficGenerator(seed=1)
    events = list(gen.stream(50))
    assert len(events) == 50

    for event in events:
        payload = json.loads(event.to_json())
        jsonschema.validate(instance=payload, schema=schema)


def test_severity_in_range():
    gen = NormalTrafficGenerator(seed=2)
    for event in gen.stream(20):
        assert 0.0 <= event.severity <= 1.0


def test_timestamp_is_iso_utc():
    gen = NormalTrafficGenerator(seed=3)
    for event in gen.stream(5):
        assert event.timestamp.endswith("Z")
