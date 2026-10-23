import logging
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.impact_agent import impact_agent
from app.agents.simulation_agent import simulation_agent
from app.config import settings
from app.db.models import Action, Incident
from app.db.session import get_db
from app.schemas.incident import (
    IncidentResponse,
    IncidentTimelineResponse,
    TimelineEventSchema,
)
from app.services.adaptive_response import adaptive_response_service
from app.services.crisis_dna import crisis_dna_service
from app.services.pipeline import incident_pipeline_service
from app.services.resource_optimizer import resource_optimizer
from app.services.uploads import save_validated_upload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    situation_text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Ingest a new crisis incident report with multimodal inputs (image, audio, text, pdf).
    Runs the full agent pipeline (Intake -> Intent -> Verify -> Risk -> Consensus).
    """
    media_files = []
    for upload, kind in ((image, "image"), (audio, "audio"), (pdf, "pdf")):
        if upload and upload.filename:
            stored = await save_validated_upload(upload, kind)
            media_files.append(
                {
                    "type": kind,
                    **stored,
                    "source": "citizen_upload",
                }
            )

    incident = await incident_pipeline_service.run_pipeline(
        db=db, situation_text=situation_text or "", media_files=media_files
    )

    # Re-query incident with relationships loaded
    return await get_incident_by_id(incident.id, db)


@router.post("/demo", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def trigger_pune_demo(db: AsyncSession = Depends(get_db)):
    """
    Executes the complete Pune Flood Demo Scenario using verified local demo assets:
    - Mutha River flood photograph at Bund Garden
    - Marathi distress voice note ("माझी आजी अडकली आहे...")
    - IMD Station 43063 warning + sensor feed
    """
    flood_img = os.path.join(settings.DEMO_ASSETS_DIR, "mutha_river_flood.jpg")
    audio_clip = os.path.join(settings.DEMO_ASSETS_DIR, "marathi_voice_note.mp3")
    weather_map = os.path.join(settings.DEMO_ASSETS_DIR, "weather_alert_map.jpg")

    media_files = [
        {
            "type": "image",
            "filename": "mutha_river_flood.jpg",
            "path": flood_img,
            "mime_type": "image/jpeg",
            "source": "citizen_upload",
        },
        {
            "type": "audio",
            "filename": "marathi_voice_note.mp3",
            "path": audio_clip,
            "mime_type": "audio/mp3",
            "source": "citizen_upload",
        },
        {
            "type": "image",
            "filename": "weather_alert_map.jpg",
            "path": weather_map,
            "mime_type": "image/jpeg",
            "source": "imd_feed",
        },
    ]

    situation_text = (
        "Severe water accumulation along Mutha riverbanks at Bund Garden, Pune. "
        "Resident reports ground-floor home flooded with water up to window level; "
        "elderly grandmother trapped inside unable to evacuate. IMD active alert."
    )

    incident = await incident_pipeline_service.run_pipeline(
        db=db, situation_text=situation_text, media_files=media_files
    )

    return await get_incident_by_id(incident.id, db)


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(db: AsyncSession = Depends(get_db)):
    """List all incidents ordered by creation time descending."""
    query = (
        select(Incident)
        .options(
            selectinload(Incident.inputs),
            selectinload(Incident.evidence_items),
            selectinload(Incident.agent_runs),
            selectinload(Incident.actions),
        )
        .order_by(Incident.created_at.desc())
    )
    result = await db.execute(query)
    incidents = result.scalars().all()

    return [format_incident_response(inc) for inc in incidents]


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch complete incident detail with inputs, evidence, agent runs, and actions."""
    return await get_incident_by_id(incident_id, db)


@router.get("/{incident_id}/timeline", response_model=IncidentTimelineResponse)
async def get_incident_timeline(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetch the chronological timeline of the incident for explainability and audit replay:
    Input Ingestion -> Intake Agent -> Intent Agent -> Verification Agent -> Risk Agent -> Consensus Agent.
    """
    incident = await get_incident_by_id(incident_id, db)

    events: List[TimelineEventSchema] = []

    # 1. Inputs ingested events
    for inp in incident.inputs:
        events.append(
            TimelineEventSchema(
                id=f"evt_inp_{inp.id}",
                event_type="input_ingested",
                timestamp=inp.created_at,
                title=f"Multimodal Input Ingested: {inp.input_type.upper()}",
                actor="Intake Dispatcher",
                confidence=1.0,
                details={
                    "input_type": inp.input_type,
                    "source": inp.source,
                    "filename": inp.filename,
                    "mime_type": inp.mime_type,
                },
            )
        )

    # 2. Agent run events in order
    agent_order = {
        "intake": 1,
        "intent": 2,
        "verification": 3,
        "risk": 4,
        "consensus": 5,
    }
    sorted_runs = sorted(
        incident.agent_runs,
        key=lambda r: (agent_order.get(r.agent_name, 99), r.created_at),
    )

    for run in sorted_runs:
        events.append(
            TimelineEventSchema(
                id=f"evt_run_{run.id}",
                event_type="agent_execution",
                timestamp=run.created_at,
                title=f"{run.agent_name.capitalize()} Agent Completed ({run.phase})",
                actor=f"{run.agent_name.capitalize()} Agent",
                confidence=run.confidence,
                details={
                    "status": run.status,
                    "confidence": run.confidence,
                    "risk_level": run.risk_level,
                    "rationale": run.rationale,
                    "duration_ms": run.duration_ms,
                    "output": run.output_payload,
                },
            )
        )

    # 3. Actions drafted
    for act in incident.actions:
        events.append(
            TimelineEventSchema(
                id=f"evt_act_{act.id}",
                event_type="action_drafted",
                timestamp=act.created_at,
                title=f"Action Drafted: {act.title}",
                actor="Action Agent",
                confidence=incident.consensus_score,
                details={
                    "action_type": act.action_type,
                    "priority": act.priority,
                    "status": act.status,
                    "requires_approval": act.requires_human_approval,
                    "content_en": act.content_en,
                    "content_mr": act.content_mr,
                },
            )
        )

    # Sort events chronologically
    events.sort(key=lambda e: e.timestamp)

    return IncidentTimelineResponse(
        incident_id=incident_id,
        total_events=len(events),
        events=events,
        confidence_evolution=incident.confidence_evolution or [],
    )


@router.post("/{incident_id}/simulate")
async def run_scenario_simulation(
    incident_id: str,
    custom_query: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Simulation Agent endpoint: Evaluates counterfactual response scenarios
    ('Act Now', 'Delay 3 Hours', 'Bridge Submergence') with outcome ranges and assumptions.
    """
    incident = await get_incident_by_id(incident_id, db)

    sim_payload = {
        "incident_title": incident.title,
        "risk_level": incident.risk_level,
        "water_level_m": 7.82,
        "discharge_cusecs": 35400,
        "custom_query": custom_query or "",
    }

    return await simulation_agent.execute_tracked(incident_id, sim_payload, db)


@router.get("/{incident_id}/optimize-resources")
async def get_resource_optimization(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Explainable Resource Optimization endpoint: Allocates boats, ambulances, shelters, and volunteers.
    """
    incident = await get_incident_by_id(incident_id, db)
    return resource_optimizer.optimize_pool(
        incident_lat=incident.latitude,
        incident_lon=incident.longitude,
        intent_summary=incident.intent_summary or {},
    )


@router.get("/{incident_id}/adaptive-response")
async def get_adaptive_response(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Adaptive Response endpoint: Tailored output packages for Citizen, Volunteer, Government, and Media.
    """
    incident = await get_incident_by_id(incident_id, db)
    return adaptive_response_service.generate_responses(
        incident_title=incident.title,
        location=incident.location_name,
        risk_level=incident.risk_level,
    )


@router.post("/{incident_id}/actions/{action_id}/approve")
async def approve_action(
    incident_id: str,
    action_id: str,
    operator_name: str = "Incident Commander (Human-in-the-Loop)",
    db: AsyncSession = Depends(get_db),
):
    """
    Human-in-the-Loop Approval: Signs off a draft response action and logs the operator decision.
    """
    query = select(Action).where(Action.id == action_id, Action.incident_id == incident_id)
    result = await db.execute(query)
    action = result.scalar_one_or_none()

    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    from datetime import datetime

    action.status = "approved"
    action.approved_by = operator_name
    action.approved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(action)

    return {
        "status": "approved",
        "action_id": action.id,
        "title": action.title,
        "approved_by": action.approved_by,
        "approved_at": action.approved_at.isoformat(),
    }


@router.post("/{incident_id}/actions/execute-all")
async def execute_all_actions(
    incident_id: str,
    operator_name: str = "Incident Commander (One-Click Execute)",
    db: AsyncSession = Depends(get_db),
):
    """
    One-Click Action Execution: Approves and generates execution logs for all pending drafts.
    """
    from datetime import datetime

    query = select(Action).where(Action.incident_id == incident_id)
    result = await db.execute(query)
    actions = result.scalars().all()

    now = datetime.utcnow()
    approved_list = []
    for act in actions:
        act.status = "approved"
        act.approved_by = operator_name
        act.approved_at = now
        approved_list.append(
            {
                "action_id": act.id,
                "title": act.title,
                "target_audience": act.target_audience,
                "bilingual_en": act.content_en,
                "bilingual_mr": act.content_mr,
                "status": "approved",
            }
        )

    await db.commit()

    return {
        "incident_id": incident_id,
        "execution_status": "executed_and_logged",
        "operator": operator_name,
        "timestamp": now.isoformat(),
        "total_actions_approved": len(approved_list),
        "actions": approved_list,
    }


@router.get("/{incident_id}/impact")
async def get_incident_impact(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Impact Agent endpoint: Returns simulated operational KPIs (people protected, MTTA, resource strain).
    """
    incident = await get_incident_by_id(incident_id, db)
    return impact_agent.compute_impact(
        incident_id=incident_id,
        risk_score=incident.risk_score,
        consensus_score=incident.consensus_score,
    )


@router.get("/{incident_id}/crisis-dna")
async def get_incident_crisis_dna(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Crisis DNA endpoint: Computes crisis fingerprint vector and nearest-neighbor historical benchmarks.
    """
    incident = await get_incident_by_id(incident_id, db)
    return crisis_dna_service.generate_fingerprint(
        hazard_type=incident.category,
        severity_score=incident.risk_score,
        water_rise_cm_hr=14.5,
        discharge_cusecs=35400,
        trapped_vulnerable_flag=True,
        escalation_prob=0.88,
        consensus_score=incident.consensus_score,
        urban_density=0.85,
    )


async def get_incident_by_id(incident_id: str, db: AsyncSession) -> IncidentResponse:
    query = (
        select(Incident)
        .options(
            selectinload(Incident.inputs),
            selectinload(Incident.evidence_items),
            selectinload(Incident.agent_runs),
            selectinload(Incident.actions),
        )
        .where(Incident.id == incident_id)
    )
    result = await db.execute(query)
    incident = result.scalar_one_or_none()

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident {incident_id} not found",
        )

    return format_incident_response(incident)


def format_incident_response(incident: Incident) -> IncidentResponse:
    return IncidentResponse(
        id=incident.id,
        title=incident.title,
        description=incident.description,
        category=incident.category,
        status=incident.status,
        location_name=incident.location_name,
        latitude=incident.latitude,
        longitude=incident.longitude,
        risk_level=incident.risk_level,
        risk_score=incident.risk_score,
        consensus_score=incident.consensus_score,
        confidence_min=incident.confidence_min,
        confidence_max=incident.confidence_max,
        is_emergency=incident.is_emergency,
        emergency_rationale=incident.emergency_rationale,
        intent_summary=incident.intent_summary or {},
        confidence_evolution=incident.confidence_evolution or [],
        inputs=[
            {
                "id": inp.id,
                "input_type": inp.input_type,
                "source": inp.source,
                "filename": inp.filename,
                "mime_type": inp.mime_type,
                "content_text": inp.content_text,
                "metadata_json": inp.metadata_json or {},
                "created_at": inp.created_at,
            }
            for inp in incident.inputs
        ],
        evidence=[
            {
                "id": evi.id,
                "claim": evi.claim,
                "verification_status": evi.verification_status,
                "confidence": evi.confidence,
                "source": evi.source,
                "source_type": evi.source_type,
                "reasoning": evi.reasoning,
                "timestamp": evi.timestamp,
            }
            for evi in incident.evidence_items
        ],
        agent_runs=[
            {
                "id": run.id,
                "agent_name": run.agent_name,
                "phase": run.phase,
                "status": run.status,
                "confidence": run.confidence,
                "risk_level": run.risk_level,
                "rationale": run.rationale,
                "input_payload": {
                    key: value
                    for key, value in (run.input_payload or {}).items()
                    if key != "media_files"
                },
                "output_payload": run.output_payload or {},
                "duration_ms": run.duration_ms,
                "created_at": run.created_at,
            }
            for run in incident.agent_runs
        ],
        actions=[
            {
                "id": act.id,
                "title": act.title,
                "action_type": act.action_type,
                "target_audience": act.target_audience,
                "priority": act.priority,
                "status": act.status,
                "content_en": act.content_en,
                "content_mr": act.content_mr,
                "requires_human_approval": act.requires_human_approval,
                "created_at": act.created_at,
            }
            for act in incident.actions
        ],
        created_at=incident.created_at,
        updated_at=incident.updated_at,
    )
