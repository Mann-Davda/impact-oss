import logging
from typing import Any, Dict

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
        self, incident_id: str, input_payload: Dict[str, Any], db: AsyncSession
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
{f"- Custom What-If Query: {custom_query}" if custom_query else ""}

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
        response = await gemini_client.generate_structured(prompt=prompt, temperature=0.1)

        if response.get("status") == "degraded" or not response.get("scenarios"):
            return {
                "disclaimer": "SIMULATION UNAVAILABLE",
                "confidence_score": 0.0,
                "rationale": "Gemini is unavailable or returned no scenarios; no simulation results are available.",
                "scenarios": [],
                "status": "degraded",
            }

        return response


simulation_agent = SimulationAgent()
