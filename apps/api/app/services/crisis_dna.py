import math
from typing import Any, Dict, List


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return round(dot_product / (magnitude1 * magnitude2), 4)


class CrisisDNAService:
    """
    Crisis DNA Engine:
    Computes a multi-dimensional crisis fingerprint per incident and performs
    nearest-neighbor cosine similarity matching against historical disaster benchmarks.
    """

    # Historical Benchmark Crisis Database (Maharashtra & India hydrological disasters)
    HISTORICAL_BENCHMARKS = [
        {
            "id": "hist_pune_2019",
            "name": "August 2019 Pune Mutha River Flood",
            "location": "Bund Garden & Sinhagad Road, Pune",
            "year": 2019,
            "vector": [1.0, 0.95, 0.85, 0.90, 1.0, 0.88, 0.92, 0.80],
            "peak_discharge_cusecs": 45400,
            "outcome_summary": "Extensive low-lying residential flooding. 400+ evacuated via NDRF boats. Precedent: Early evacuation of elderly prevented loss of life.",
            "lessons_learned": "Prioritize shallow-draft boats for Bund Garden river wall sector before peak dam discharge arrives.",
        },
        {
            "id": "hist_mutha_2005",
            "name": "August 2005 Pune Monsoon Deluge",
            "location": "Mula-Mutha Basin, Pune",
            "year": 2005,
            "vector": [1.0, 0.88, 0.70, 0.75, 0.8, 0.82, 0.85, 0.78],
            "peak_discharge_cusecs": 38000,
            "outcome_summary": "Prolonged waterlogging. Babasaheb Ambedkar Bridge closed for 18 hours.",
            "lessons_learned": "Pre-stage ALS ambulances on South bank to avoid isolation if Ambedkar bridge is cordoned.",
        },
        {
            "id": "hist_mahad_2021",
            "name": "July 2021 Mahad Savitri River Flood",
            "location": "Mahad, Raigad, Maharashtra",
            "year": 2021,
            "vector": [0.8, 0.98, 0.95, 0.60, 0.9, 0.95, 0.78, 0.40],
            "peak_discharge_cusecs": 60000,
            "outcome_summary": "Rapid flash inundation compounded by hillslope mudflows.",
            "lessons_learned": "Communication blackouts occur early; broadcast bilingual radio/SMS alerts immediately.",
        },
        {
            "id": "hist_hyd_2020",
            "name": "October 2020 Hyderabad Urban Flash Deluge",
            "location": "Musi River Basin, Hyderabad",
            "year": 2020,
            "vector": [0.6, 0.75, 0.90, 0.30, 0.5, 0.65, 0.70, 0.90],
            "peak_discharge_cusecs": 22000,
            "outcome_summary": "Intense urban storm runoff overwhelmed municipal stormwater drains.",
            "lessons_learned": "Urban storm gridlock differs from riverine reservoir discharge.",
        },
    ]

    @classmethod
    def generate_fingerprint(
        cls,
        hazard_type: str = "riverine_flood",
        severity_score: float = 0.94,
        water_rise_cm_hr: float = 14.5,
        discharge_cusecs: float = 35400,
        trapped_vulnerable_flag: bool = True,
        escalation_prob: float = 0.88,
        consensus_score: float = 0.86,
        urban_density: float = 0.85,
    ) -> Dict[str, Any]:
        # Normalize vector dimensions (0.0 to 1.0)
        norm_type = 1.0 if "flood" in hazard_type.lower() else 0.5
        norm_severity = min(1.0, max(0.0, severity_score))
        norm_rise = min(1.0, water_rise_cm_hr / 20.0)
        norm_discharge = min(1.0, discharge_cusecs / 50000.0)
        norm_vulnerable = 1.0 if trapped_vulnerable_flag else 0.2
        norm_escalation = min(1.0, max(0.0, escalation_prob))
        norm_consensus = min(1.0, max(0.0, consensus_score))
        norm_density = min(1.0, max(0.0, urban_density))

        incident_vector = [
            norm_type,
            norm_severity,
            norm_rise,
            norm_discharge,
            norm_vulnerable,
            norm_escalation,
            norm_consensus,
            norm_density,
        ]

        # Calculate cosine similarity against benchmarks
        matches = []
        for benchmark in cls.HISTORICAL_BENCHMARKS:
            sim = cosine_similarity(incident_vector, benchmark["vector"])
            matches.append(
                {
                    "benchmark_id": benchmark["id"],
                    "name": benchmark["name"],
                    "location": benchmark["location"],
                    "year": benchmark["year"],
                    "similarity_score": sim,
                    "similarity_percentage": f"{int(sim * 100)}%",
                    "peak_discharge_cusecs": benchmark["peak_discharge_cusecs"],
                    "outcome_summary": benchmark["outcome_summary"],
                    "tactical_lesson": benchmark["lessons_learned"],
                }
            )

        matches.sort(key=lambda m: m["similarity_score"], reverse=True)

        return {
            "fingerprint_id": f"dna_{int(severity_score * 1000)}_{int(discharge_cusecs)}",
            "crisis_dna_vector": [round(v, 3) for v in incident_vector],
            "dna_dimensions": [
                {
                    "dimension": "Hazard Modality",
                    "value": "Riverine Flood Inundation",
                    "index": norm_type,
                },
                {
                    "dimension": "Severity Magnitude",
                    "value": f"{int(norm_severity * 100)}%",
                    "index": norm_severity,
                },
                {
                    "dimension": "Water Rise Rate",
                    "value": f"{water_rise_cm_hr} cm/hr",
                    "index": norm_rise,
                },
                {
                    "dimension": "Dam Discharge Pressure",
                    "value": f"{int(discharge_cusecs):,} cusecs",
                    "index": norm_discharge,
                },
                {
                    "dimension": "Vulnerable Entrapment",
                    "value": "Elderly Resident Trapped",
                    "index": norm_vulnerable,
                },
                {
                    "dimension": "Escalation Threat",
                    "value": f"{int(norm_escalation * 100)}%",
                    "index": norm_escalation,
                },
                {
                    "dimension": "Multi-Agent Consensus",
                    "value": f"{int(norm_consensus * 100)}%",
                    "index": norm_consensus,
                },
                {
                    "dimension": "Urban Corridor Density",
                    "value": "High Urban Density",
                    "index": norm_density,
                },
            ],
            "top_historical_match": matches[0] if matches else None,
            "similar_incidents": matches,
        }


crisis_dna_service = CrisisDNAService()
