from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EventSchema(BaseModel):
    id: str
    timestamp: datetime
    type: str
    user: str
    source_ip: str
    session_id: str
    resource: str
    anomaly_score: float
    attack_type: Optional[str]
    severity: float

class EvidenceSchema(BaseModel):
    timestamp: datetime
    user: str
    ip: str
    session: str
    event_type: str
    anomaly_score: float
    classification: str
    resource: str

class IncidentSchema(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    severity: str
    risk_score: float
    attack_type: str
    status: str
    events: List[str]
    evidence: List[EvidenceSchema]
    recommended_action: str
