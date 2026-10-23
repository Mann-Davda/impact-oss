import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models import Incident, IncidentInput, Action, Resource
from app.agents.intake_agent import intake_agent
from app.agents.intent_agent import intent_agent
from app.agents.verification_agent import verification_agent
from app.agents.risk_agent import risk_agent
from app.agents.consensus_agent import consensus_agent
from app.services.weather_feed import weather_feed_service
from app.config import settings

logger = logging.getLogger(__name__)

class IncidentPipelineService:
    """
    Coordinates the core multimodal crisis decision-support pipeline:
    Inputs -> Ingestion -> Intent -> Verification -> Risk -> Consensus -> Draft Actions.
    """

    @staticmethod
    async def run_pipeline(
        db: AsyncSession,
        situation_text: str = "",
        media_files: Optional[List[Dict[str, Any]]] = None,
        incident_id: Optional[str] = None
    ) -> Incident:
        media_files = media_files or []

        # 1. Create or retrieve incident
        if incident_id:
            result = await db.execute(select(Incident).where(Incident.id == incident_id))
            incident = result.scalar_one_or_none()
            if not incident:
                incident = Incident(id=incident_id, title="Processing Incident...")
                db.add(incident)
        else:
            incident = Incident(
                title="Pune Mutha River Flood Alert",
                description=situation_text or "Multimodal emergency submission",
                category="flood",
                status="processing"
            )
            db.add(incident)

        await db.commit()
        await db.refresh(incident)

        # 2. Record inputs in database
        for media in media_files:
            inp = IncidentInput(
                incident_id=incident.id,
                input_type=media.get("type", "image"),
                source=media.get("source", "citizen_upload"),
                filename=media.get("filename"),
                file_path=media.get("path"),
                mime_type=media.get("mime_type"),
                content_text=media.get("text")
            )
            db.add(inp)

        if situation_text:
            text_inp = IncidentInput(
                incident_id=incident.id,
                input_type="text",
                source="citizen_upload",
                content_text=situation_text
            )
            db.add(text_inp)

        await db.commit()

        # 3. Fetch weather & sensor feed
        weather_data = weather_feed_service.get_pune_weather_context()

        # 4. Run Intake Agent
        intake_payload = {
            "media_files": media_files,
            "situation_text": situation_text
        }
        intake_res = await intake_agent.execute_tracked(incident.id, intake_payload, db)

        # 5. Run Intent Agent
        intent_payload = {
            "intake_data": intake_res
        }
        intent_res = await intent_agent.execute_tracked(incident.id, intent_payload, db)

        # 6. Run Verification Agent
        verify_payload = {
            "intake_data": intake_res,
            "intent_data": intent_res,
            "weather_data": weather_data,
            "media_files": media_files
        }
        verify_res = await verification_agent.execute_tracked(incident.id, verify_payload, db)

        # 7. Run Risk Agent
        risk_payload = {
            "intake_data": intake_res,
            "intent_data": intent_res,
            "verification_data": verify_res,
            "weather_data": weather_data
        }
        risk_res = await risk_agent.execute_tracked(incident.id, risk_payload, db)

        # 8. Run Consensus Agent
        consensus_payload = {
            "intake_res": intake_res,
            "intent_res": intent_res,
            "verify_res": verify_res,
            "risk_res": risk_res
        }
        consensus_res = await consensus_agent.execute_tracked(incident.id, consensus_payload, db)

        # 9. Update Incident Record
        incident.title = intake_res.get("incident_title", "Mutha River Flood Inundation & Trapped Citizen Rescue")
        incident.description = intake_res.get("situational_summary", situation_text)
        incident.category = intake_res.get("hazard_category", "riverine_flood")
        incident.location_name = intake_res.get("detected_location", "Bund Garden, Pune, Maharashtra")
        
        # Risk & consensus scores
        incident.risk_level = risk_res.get("threat_level", "critical")
        incident.risk_score = float(risk_res.get("risk_score", 0.92))
        incident.consensus_score = float(consensus_res.get("consensus_score", 0.89))
        incident.confidence_min = float(risk_res.get("confidence_min", 0.82))
        incident.confidence_max = float(risk_res.get("confidence_max", 0.96))
        
        incident.is_emergency = bool(risk_res.get("is_emergency", incident.risk_level == "critical"))
        incident.emergency_rationale = risk_res.get("emergency_rationale", "Emergency mode triggered due to critical threat level.")
        
        incident.status = "critical" if incident.is_emergency else "verified"
        incident.intent_summary = intent_res
        incident.confidence_evolution = consensus_res.get("confidence_evolution", [])
        incident.updated_at = datetime.utcnow()

        # 10. Generate draft actions (Rule 4: Human in the loop, draft only, requiring explicit approval)
        # Action 1: Tactical Rescue
        act1 = Action(
            incident_id=incident.id,
            title="Dispatch NDRF Inflatable Rescue Boat & Geriatric Paramedic Team",
            action_type="dispatch_boat",
            target_audience="government",
            priority="critical",
            status="draft",
            content_en="Deploy specialized motorized inflatable rescue boat to Bund Garden riverbank sector. Priority mission: Extract trapped elderly citizen from ground-level structure and transfer to standby geriatric ambulance unit.",
            content_mr="बंड गार्डन नदीकाठ परिसरात तातडीने एनडीआरएफ रबर बोट आणि वैद्यकीय पथक पाठवा. पूरबाधित घरात अडकलेल्या वृद्ध आजींची सुरक्षित सुटका करून त्यांना रुग्णवाहिकेत हलवा.",
            requires_human_approval=True
        )
        # Action 2: Citizen Evacuation Advisory
        act2 = Action(
            incident_id=incident.id,
            title="Issue Mutha Riverbank Low-Lying Sector Evacuation Advisory",
            action_type="evacuate",
            target_audience="citizen",
            priority="high",
            status="draft",
            content_en="URGENT: Mutha River level has exceeded danger threshold due to Khadakwasla discharge. Residents along Bund Garden corridor must move immediately to designated higher-ground shelters. Avoid Babasaheb Ambedkar Bridge approach.",
            content_mr="तातडीची सूचना: खडकवासला धरणातून पाण्याचा विसर्ग वाढल्यामुळे मुळा-मुठा नदीने धोक्याची पातळी ओलांडली आहे. बंड गार्डन भागातील नागरिकांनी तात्काळ जवळच्या सुरक्षित निवारा केंद्रात स्थलांतरित व्हावे.",
            requires_human_approval=True
        )
        db.add(act1)
        db.add(act2)

        # 11. Populate demo resources if none exist
        res_check = await db.execute(select(Resource).limit(1))
        if not res_check.scalar_one_or_none():
            resources_demo = [
                Resource(
                    incident_id=incident.id,
                    resource_type="rescue_boat",
                    name="NDRF Motorized Boat Team 4",
                    location_name="Bund Garden Boat Club Staging Area",
                    latitude=18.5412,
                    longitude=73.8821,
                    status="available",
                    capacity=6,
                    source="mock"
                ),
                Resource(
                    incident_id=incident.id,
                    resource_type="ambulance",
                    name="Sassoon Hospital Advanced Life Support Ambulance 02",
                    location_name="Station Road Junction, Pune",
                    latitude=18.5315,
                    longitude=73.8742,
                    status="available",
                    capacity=2,
                    source="mock"
                ),
                Resource(
                    incident_id=incident.id,
                    resource_type="shelter",
                    name="Pune Municipal Corporation Relief Shelter - Camp",
                    location_name="St. Helena High School Complex, Pune",
                    latitude=18.5284,
                    longitude=73.8812,
                    status="available",
                    capacity=250,
                    source="mock"
                )
            ]
            for r in resources_demo:
                db.add(r)

        await db.commit()
        await db.refresh(incident)
        return incident

incident_pipeline_service = IncidentPipelineService()
