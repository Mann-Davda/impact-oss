from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class EvidenceItemSchema(BaseModel):
    id: Optional[str] = None
    claim: str
    verification_status: str = "verified"  # verified, inconclusive, refuted
    confidence: float = Field(ge=0.0, le=1.0)
    source: str
    source_type: str
    reasoning: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentRunSchema(BaseModel):
    id: Optional[str] = None
    agent_name: str
    phase: str = "core_pipeline"
    status: str = "success"
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: Optional[str] = None
    rationale: str
    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Dict[str, Any] = Field(default_factory=dict)
    duration_ms: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InputItemSchema(BaseModel):
    id: Optional[str] = None
    input_type: str
    source: str = "citizen_upload"
    filename: Optional[str] = None
    file_path: Optional[str] = None
    mime_type: Optional[str] = None
    content_text: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActionItemSchema(BaseModel):
    id: Optional[str] = None
    title: str
    action_type: str
    target_audience: str
    priority: str
    status: str
    content_en: str
    content_mr: str
    requires_human_approval: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ConsensusMetricsSchema(BaseModel):
    consensus_score: float = Field(ge=0.0, le=1.0)
    confidence_min: float
    confidence_max: float
    per_agent_scores: Dict[str, float]
    agreement_factors: List[str]
    disagreement_factors: List[str]
    rationale: str

class TimelineEventSchema(BaseModel):
    id: str
    event_type: str  # input_ingested, agent_execution, consensus_reached, action_drafted
    timestamp: datetime
    title: str
    actor: str
    confidence: Optional[float] = None
    details: Dict[str, Any] = Field(default_factory=dict)

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    status: str
    location_name: str
    latitude: float
    longitude: float
    risk_level: str
    risk_score: float
    consensus_score: float
    confidence_min: float
    confidence_max: float
    is_emergency: bool
    emergency_rationale: Optional[str] = None
    intent_summary: Dict[str, Any] = Field(default_factory=dict)
    confidence_evolution: List[Dict[str, Any]] = Field(default_factory=list)
    inputs: List[InputItemSchema] = Field(default_factory=list)
    evidence: List[EvidenceItemSchema] = Field(default_factory=list)
    agent_runs: List[AgentRunSchema] = Field(default_factory=list)
    actions: List[ActionItemSchema] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

class IncidentTimelineResponse(BaseModel):
    incident_id: str
    total_events: int
    events: List[TimelineEventSchema]
    confidence_evolution: List[Dict[str, Any]]
