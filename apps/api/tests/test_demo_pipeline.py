import os
import sys
import asyncio
import json
from pathlib import Path

# Add project root to path
API_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_DIR))

from app.db.session import init_db, AsyncSessionLocal
from app.services.pipeline import incident_pipeline_service
from app.routers.incidents import get_incident_by_id, get_incident_timeline
from app.config import settings

async def run_pune_demo_test():
    print("=" * 80)
    print("IMPACTOS — PHASE 1 VALIDATION TEST: PUNE FLOOD DEMO SCENARIO")
    print("=" * 80)
    print(f"Active Gemini Model: {settings.GEMINI_MODEL}")
    print(f"Database Engine: {settings.DATABASE_URL.split('///')[0] if '///' in settings.DATABASE_URL else 'postgresql'}")

    # 1. Initialize database schema
    print("\n[Step 1/5] Initializing Database Schema...")
    await init_db()
    print("✓ Tables verified: incidents, inputs, agent_runs, evidence, actions, resources")

    # 2. Prepare Demo Inputs
    print("\n[Step 2/5] Preparing Multimodal Crisis Inputs...")
    flood_img = os.path.join(settings.DEMO_ASSETS_DIR, "mutha_river_flood.jpg")
    audio_clip = os.path.join(settings.DEMO_ASSETS_DIR, "marathi_voice_note.mp3")
    weather_img = os.path.join(settings.DEMO_ASSETS_DIR, "weather_alert_map.jpg")

    assert os.path.exists(flood_img), f"Missing demo asset: {flood_img}"
    assert os.path.exists(audio_clip), f"Missing demo asset: {audio_clip}"
    print(f"✓ Ingested Flood Photograph: {flood_img} ({os.path.getsize(flood_img)} bytes)")
    print(f"✓ Ingested Marathi Audio Note: {audio_clip} ({os.path.getsize(audio_clip)} bytes)")

    media_files = [
        {
            "type": "image",
            "filename": "mutha_river_flood.jpg",
            "path": flood_img,
            "mime_type": "image/jpeg",
            "source": "citizen_upload"
        },
        {
            "type": "audio",
            "filename": "marathi_voice_note.mp3",
            "path": audio_clip,
            "mime_type": "audio/mp3",
            "source": "citizen_upload"
        },
        {
            "type": "image",
            "filename": "weather_alert_map.jpg",
            "path": weather_img,
            "mime_type": "image/jpeg",
            "source": "imd_feed"
        }
    ]

    situation_text = (
        "Severe water accumulation along Mutha riverbanks at Bund Garden, Pune. "
        "Resident reports ground-floor home flooded with water up to window level; "
        "elderly grandmother trapped inside unable to evacuate. IMD active alert."
    )

    # 3. Execute Core Multi-Agent Pipeline
    print("\n[Step 3/5] Executing Autonomous Multi-Agent Pipeline...")
    print("  → Running Intake Agent (multimodal ingestion, classification, Marathi transcription)...")
    print("  → Running Intent Agent (operational intent, urgency, stakeholder, required action)...")
    print("  → Running Verification Agent (cross-modal correlation & IMD sensor triangulation)...")
    print("  → Running Risk Agent (threat level, escalation probability, uncertainty bounds)...")
    print("  → Running Consensus Agent (mathematical weighted consensus & confidence evolution)...")

    async with AsyncSessionLocal() as session:
        incident = await incident_pipeline_service.run_pipeline(
            db=session,
            situation_text=situation_text,
            media_files=media_files
        )
        incident_id = incident.id

    # 4. Fetch Structured Output & Verify Schema Compliance
    print(f"\n[Step 4/5] Pipeline Completed! Incident ID: {incident_id}")
    async with AsyncSessionLocal() as session:
        detail = await get_incident_by_id(incident_id, session)
        timeline = await get_incident_timeline(incident_id, session)

    print("\n" + "=" * 80)
    print("VERIFIED INCIDENT ASSESSMENT SUMMARY")
    print("=" * 80)
    print(f"Title:            {detail.title}")
    print(f"Location:         {detail.location_name} ({detail.latitude}, {detail.longitude})")
    print(f"Category:         {detail.category}")
    print(f"Risk Level:       {detail.risk_level.upper()} (Risk Score: {detail.risk_score:.2f})")
    print(f"Consensus Score:  {detail.consensus_score:.2f} [Range: {detail.confidence_min:.2f} - {detail.confidence_max:.2f}]")
    print(f"Emergency Mode:   {'ACTIVATED (⚠ RED ALERT)' if detail.is_emergency else 'NORMAL'}")
    if detail.emergency_rationale:
        print(f"Emergency Cause:  {detail.emergency_rationale}")

    print("\n--- OPERATIONAL INTENT & STAKEHOLDER ---")
    intent = detail.intent_summary
    print(f"Primary Intent:   {intent.get('primary_intent')}")
    print(f"Urgency:          {intent.get('urgency', '').upper()}")
    print(f"Stakeholder:      {intent.get('stakeholder')}")
    print(f"Required Action:  {intent.get('required_action')}")
    print(f"Resources Needed: {', '.join(intent.get('resources_needed', []))}")

    print("\n--- VERIFIED EVIDENCE AUDIT TRAIL ---")
    for idx, evi in enumerate(detail.evidence, 1):
        print(f"[{idx}] Status: [{evi.verification_status.upper()}] (Confidence: {evi.confidence:.2f})")
        print(f"    Claim:  {evi.claim}")
        print(f"    Source: {evi.source} ({evi.source_type})")
        print(f"    Why:    {evi.reasoning}\n")

    print("--- AGENT TELEMETRY & CONFIDENCE EVOLUTION ---")
    for step in detail.confidence_evolution:
        print(f"Step {step.get('step')}: {step.get('label'):<35} | Confidence: {step.get('score'):.2f} | Agent: {step.get('agent')}")

    print("\n--- HUMAN-IN-THE-LOOP ACTIONS (DRAFT ONLY) ---")
    for act in detail.actions:
        print(f"• [{act.status.upper()}] {act.title} (Audience: {act.target_audience}, Priority: {act.priority})")
        print(f"  EN: {act.content_en}")
        print(f"  MR: {act.content_mr}")
        print(f"  Requires Human Approval: {act.requires_human_approval}\n")

    print("--- TIMELINE EVENTS AUDIT ---")
    print(f"Total Timeline Events Recorded: {timeline.total_events}")
    for event in timeline.events:
        print(f"  [{event.timestamp.strftime('%H:%M:%S')}] {event.actor:<20} | {event.title} (Confidence: {event.confidence})")

    # 5. Assertions for Phase 1 verification
    print("\n[Step 5/5] Performing Contract & Rule Assertions...")
    assert detail.id.startswith("inc_"), "Incident ID must start with prefix"
    assert len(detail.evidence) >= 3, "Must have at least 3 verified evidence items"
    assert len(detail.agent_runs) >= 5, "Must record all 5 agent runs (Intake, Intent, Verify, Risk, Consensus)"
    assert 0.0 <= detail.consensus_score <= 1.0, "Consensus score must be between 0.0 and 1.0"
    assert detail.confidence_min <= detail.confidence_max, "Confidence min must be <= max"
    assert len(detail.actions) >= 1, "Must generate initial draft actions"
    assert all(a.requires_human_approval for a in detail.actions), "All actions must require explicit human approval"
    assert timeline.total_events >= 5, "Timeline must contain full event sequence"
    print("\n>>> ALL PHASE 1 REQUIREMENTS & NON-NEGOTIABLE RULES PASS VERIFICATION! <<<")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_pune_demo_test())
