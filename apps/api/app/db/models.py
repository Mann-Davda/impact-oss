import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("inc"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), default="flood")
    status = Column(String(32), default="verifying")  # reported, verifying, verified, critical, action_ready, closed
    
    # Location
    location_name = Column(String(255), default="Bund Garden, Pune, Maharashtra")
    latitude = Column(Float, default=18.542457)
    longitude = Column(Float, default=73.883776)
    
    # Trust & Risk metrics (computed, no fabricated numbers)
    risk_level = Column(String(32), default="moderate")  # low, moderate, high, critical
    risk_score = Column(Float, default=0.0)             # 0.0 to 1.0
    consensus_score = Column(Float, default=0.0)        # 0.0 to 1.0
    confidence_min = Column(Float, default=0.0)         # Uncertainty range lower
    confidence_max = Column(Float, default=1.0)         # Uncertainty range upper
    
    is_emergency = Column(Boolean, default=False)       # Triggered when risk_level == critical
    emergency_rationale = Column(Text, nullable=True)
    
    # Structured Intent Summary
    intent_summary = Column(JSON, default=dict)
    
    # Confidence Evolution Log: list of {timestamp, agent, score, rationale}
    confidence_evolution = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    inputs = relationship("IncidentInput", back_populates="incident", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="incident", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="incident", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="incident")


class IncidentInput(Base):
    __tablename__ = "inputs"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("inp"))
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    input_type = Column(String(32), nullable=False)  # image, audio, text, pdf, weather_feed
    source = Column(String(64), default="citizen_upload")  # citizen_upload, imd_feed, mock
    filename = Column(String(255), nullable=True)
    file_path = Column(String(512), nullable=True)
    mime_type = Column(String(64), nullable=True)
    content_text = Column(Text, nullable=True)        # Situation text or transcript
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="inputs")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("run"))
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(64), nullable=False)  # intake, intent, verification, risk, consensus
    phase = Column(String(32), default="core_pipeline")
    status = Column(String(32), default="success")   # success, failed, degraded
    confidence = Column(Float, default=0.0)          # 0.0 to 1.0
    risk_level = Column(String(32), nullable=True)   # low, moderate, high, critical
    rationale = Column(Text, nullable=False)
    
    # Complete telemetry
    input_payload = Column(JSON, default=dict)
    output_payload = Column(JSON, default=dict)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="agent_runs")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("evi"))
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    claim = Column(Text, nullable=False)
    verification_status = Column(String(32), default="verified")  # verified, inconclusive, refuted
    confidence = Column(Float, default=1.0)
    source = Column(String(128), nullable=False)  # e.g., "IMD Station 43063", "Photo Geotag", "Marathi Voice Note"
    source_type = Column(String(32), nullable=False)  # image, audio, weather_feed, cross_modal, mock
    reasoning = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="evidence_items")


class Action(Base):
    __tablename__ = "actions"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("act"))
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    action_type = Column(String(64), nullable=False)  # evacuate, dispatch_boat, medical_alert, route_closure
    target_audience = Column(String(64), default="citizen")  # citizen, volunteer, government, media
    priority = Column(String(32), default="critical")  # critical, high, medium, low
    status = Column(String(32), default="draft")  # draft, approved, executed, cancelled
    
    # Bilingual content
    content_en = Column(Text, nullable=False)
    content_mr = Column(Text, nullable=False)  # Marathi translation
    
    # Human-in-the-loop guarantee
    requires_human_approval = Column(Boolean, default=True)
    approved_by = Column(String(128), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="actions")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(64), primary_key=True, default=lambda: generate_id("res"))
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    resource_type = Column(String(64), nullable=False)  # ambulance, rescue_boat, shelter, volunteer_team
    name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(32), default="available")  # available, allocated, dispatched, depleted
    capacity = Column(Integer, default=1)
    assigned_to = Column(String(128), nullable=True)
    source = Column(String(32), default="mock")  # Explicitly labelled demo/mock data
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    incident = relationship("Incident", back_populates="resources")
