import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.agents.gemini_client import gemini_client

logger = logging.getLogger(__name__)

class SimulationAgent(BaseAgent):
    """
    Simulation Agent: Generates and evaluates counterfactual response scenarios:
    - Act Now (Immediate amphibious extraction)
    - Delay 3 Hours (Shelter-in-place)
    - Infrastructure Failure (Babasaheb Ambedkar bridge access lost)
    Returns estimated outcome ranges, confidence, and mandatory explicit assumptions.
    Labels all outputs as estimates, never predictions.
    """
    def __init__(self):
        super().__init__(name="simulation", phase="scenario_simulation")

    async def process(
        self,
        incident_id: str,
        input_payload: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        incident_title = input_payload.get("incident_title", "Pune Mutha River Flood")
        hazard_level = input_payload.get("risk_level", "critical")
        water_level = input_payload.get("water_level_m", 7.82)
        discharge_cusecs = input_payload.get("discharge_cusecs", 35400)
        custom_query = input_payload.get("custom_query", "")

        prompt = f"""
You are the ImpactOS Crisis Simulation & Counterfactual Modeling Agent.
Evaluate potential response scenarios for Incident {incident_id}:
- Title: {incident_title}
- Risk Level: {hazard_level}
- Water Level: {water_level}m (+1.32m over danger mark)
- Khadakwasla Dam Discharge: {discharge_cusecs} cusecs
{f'- Custom What-If Query: {custom_query}' if custom_query else ''}

Mandatory Rules:
1. All numbers MUST be presented as estimated ranges with confidence bounds, never exact predictions.
2. Every scenario MUST state explicit operational assumptions.
3. Label output explicitly as "SIMULATION ESTIMATES: NOT CERTAIN PREDICTIONS".

Evaluate 3 distinct comparative scenarios:
Scenario 1: "Immediate Amphibious Evacuation (Act Now)"
Scenario 2: "Delayed Evacuation (Wait 3 Hours for Inflow Stabilization)"
Scenario 3: "Cascading Infrastructure Failure (Babasaheb Ambedkar Bridge Submerged)"

For EACH scenario, return:
- scenario_id: "act_now" | "delay_3h" | "bridge_failure"
- name: string
- description: string
- estimated_evacuation_time_mins: [min, max]
- estimated_people_rescued: [min, max]
- health_risk_exposure: "minimal" | "moderate" | "severe" | "catastrophic"
- assumptions: ["string", "string"]
- confidence_score: float (0.0 to 1.0)
- recommendation: "RECOMMENDED" | "NOT RECOMMENDED" | "HIGH RISK CONTINGENCY"
- reasoning: string

Respond ONLY with valid JSON:
{{
  "disclaimer": "SIMULATION ESTIMATES: NOT CERTAIN PREDICTIONS",
  "confidence_score": 0.88,
  "rationale": "Comparative delta models indicate immediate action minimizes life-safety risk by 78% over delay.",
  "scenarios": [
    {{
      "scenario_id": "string",
      "name": "string",
      "description": "string",
      "estimated_evacuation_time_mins": [0, 0],
      "estimated_people_rescued": [0, 0],
      "health_risk_exposure": "string",
      "assumptions": ["string"],
      "confidence_score": 0.0,
      "recommendation": "string",
      "reasoning": "string"
    }}
  ]
}}
"""
        response = await gemini_client.generate_structured(
            prompt=prompt,
            temperature=0.1
        )

        if response.get("status") == "degraded" or not response.get("scenarios"):
            return {
                "disclaimer": "SIMULATION ESTIMATES: NOT CERTAIN PREDICTIONS",
                "confidence_score": 0.86,
                "rationale": "Immediate deployment prevents hypothermia and structural entrapment as river rises at 14.5 cm/hr.",
                "scenarios": [
                    {
                        "scenario_id": "act_now",
                        "name": "Immediate Amphibious Evacuation (Act Now)",
                        "description": "Deploy NDRF Inflatable Boat 4 and Sassoon ALS Paramedics immediately to Bund Garden bank.",
                        "estimated_evacuation_time_mins": [25, 45],
                        "estimated_people_rescued": [1, 4],
                        "health_risk_exposure": "minimal",
                        "assumptions": [
                            "River current remains under 4.5 knots during crossing",
                            "Ground-floor entrance remains accessible via boat bow",
                            "ALS unit is staged within 1.5 km of rendezvous point"
                        ],
                        "confidence_score": 0.91,
                        "recommendation": "RECOMMENDED",
                        "reasoning": "Fastest extraction window before upstream Khadakwasla surge peak reaches Bund Garden corridor."
                    },
                    {
                        "scenario_id": "delay_3h",
                        "name": "Delayed Response (Shelter-in-Place for 3 Hours)",
                        "description": "Wait for daytime visibility and potential dam discharge moderation before dispatching resources.",
                        "estimated_evacuation_time_mins": [90, 180],
                        "estimated_people_rescued": [0, 2],
                        "health_risk_exposure": "severe",
                        "assumptions": [
                            "Water level rises by an additional 35–45 cm into residential living space",
                            "Electrical short circuits and utility outages occur",
                            "Elderly patient experiences acute respiratory/hypothermic distress"
                        ],
                        "confidence_score": 0.84,
                        "recommendation": "NOT RECOMMENDED",
                        "reasoning": "High risk of life loss due to trapped resident's inability to climb to roof level."
                    },
                    {
                        "scenario_id": "bridge_failure",
                        "name": "Contingency: Babasaheb Ambedkar Bridge Submerged",
                        "description": "Primary arterial crossing becomes impassable; divert all medical transport via Sangamwadi route.",
                        "estimated_evacuation_time_mins": [50, 75],
                        "estimated_people_rescued": [1, 4],
                        "health_risk_exposure": "moderate",
                        "assumptions": [
                            "Babasaheb Ambedkar Bridge closed to all vehicular traffic by traffic police",
                            "Sangamwadi bypass remains clear of flood backwaters",
                            "Secondary ambulance rendezvous point activated at Boat Club lane"
                        ],
                        "confidence_score": 0.87,
                        "recommendation": "HIGH RISK CONTINGENCY",
                        "reasoning": "Adds 20-30 minutes transport delay to Sassoon Hospital; requires immediate route broadcast to dispatchers."
                    }
                ],
                "status": "degraded"
            }

        return response

simulation_agent = SimulationAgent()
