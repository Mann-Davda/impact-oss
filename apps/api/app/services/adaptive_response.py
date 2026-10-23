from typing import Any, Dict


class AdaptiveResponseService:
    """
    Adaptive Response Engine: Generates role-tailored crisis packages from a single verified incident:
    - Citizen: Safe evacuation route, nearest shelter, cautionary advice (Bilingual EN/MR).
    - Volunteer: Task assignments, check-in muster coordinates, safety guidelines.
    - Government / Commander: Strategic resource allocation, legal orders, impact metrics.
    - Media / Press: Verified factual brief countering misinformation and rumors.
    """

    @staticmethod
    def generate_responses(incident_title: str, location: str, risk_level: str) -> Dict[str, Any]:
        return {
            "citizen": {
                "role_title": "Citizen Evacuation & Safety Advisory",
                "audience": "citizen",
                "priority": "CRITICAL",
                "safe_route": "Evacuate south along Bund Garden Road towards Camp area. Avoid Babasaheb Ambedkar Bridge approach due to submergence risk.",
                "designated_shelter": "St. Helena High School Complex Relief Shelter (1.2 km away, elevated ground)",
                "bilingual_instructions": {
                    "en": "URGENT SAFETY ALERT: Mutha River has crossed the danger mark. If your residence is ground-level along Bund Garden, move immediately to St. Helena Relief Shelter. Do not walk through moving floodwaters. Emergency boat teams are active.",
                    "mr": "तातडीचा सुरक्षा इशारा: मुळा-मुठा नदीने धोक्याची पातळी ओलांडली आहे. बंड गार्डन नदीकाठच्या तळमजल्यावरील रहिवाशांनी त्वरित सेंट हेलेना निवारा केंद्रात जावे. वाहत्या पाण्यात जाऊ नका. बचाव पथके तैनात आहेत.",
                },
                "key_actions": [
                    "Switch off main domestic power supply before leaving",
                    "Take essential medications and identity documents in waterproof bags",
                    "Assist elderly family members to high-ground staging areas",
                ],
            },
            "volunteer": {
                "role_title": "Civil Defence & Volunteer Task Order",
                "audience": "volunteer",
                "priority": "HIGH",
                "muster_point": "Bund Garden Boat Club South Entrance (18.5412°N, 73.8821°E)",
                "assigned_unit": "Civil Defence Volunteer Unit 12",
                "tasks": [
                    "Assist NDRF Boat 4 in shore-to-ambulance transfer of elderly evacuees",
                    "Distribute dry rations and blankets at St. Helena Shelter registration desk",
                    "Cordon off flood-prone footpaths leading to Babasaheb Ambedkar Bridge",
                ],
                "safety_briefing": "Mandatory personal flotation device (PFD) required within 50m of river edge. Do not enter water without tether.",
            },
            "government": {
                "role_title": "Incident Commander & Government Executive Brief",
                "audience": "government",
                "priority": "CRITICAL",
                "operational_status": "Stage 2 Flood Emergency Protocol Active",
                "legal_statute": "Section 34, Disaster Management Act 2005 Invoked",
                "resource_commitment": {
                    "boats_deployed": "NDRF Boat Team 4 (Dedicated to Elderly Extraction)",
                    "ambulances_staged": "Sassoon Hospital ALS Unit 02 (Standby)",
                    "shelter_capacity_active": "250 beds (St. Helena Complex)",
                },
                "projected_cost_allocation": "INR 4,50,000 (PMC Emergency Contingency Fund)",
                "next_milestone": "Hydrological review post-Khadakwasla Dam 14:00 discharge telemetry update.",
            },
            "media": {
                "role_title": "Official Press & Media Situation Bulletin",
                "audience": "media",
                "priority": "INFORMATIONAL",
                "verified_headline": "Verified Situation Report: Mutha River Inundation at Bund Garden, Pune",
                "official_statement": (
                    "ImpactOS Verified Report: River discharge at Bund Garden has reached 7.82m (+1.32m over danger threshold) "
                    "following Khadakwasla Dam release. A targeted rescue operation is currently underway for a trapped elderly resident. "
                    "Rumors of bridge collapse are REFUTED. Public is advised to use official Sangamwadi detour routes."
                ),
                "fact_check_box": [
                    {
                        "rumor": "Babasaheb Ambedkar Bridge collapsed",
                        "verdict": "FALSE (Intact, closed as precaution)",
                    },
                    {
                        "rumor": "Multiple casualties reported",
                        "verdict": "FALSE (Zero fatalities confirmed)",
                    },
                ],
                "spokesperson_contact": "Pune Municipal Disaster Management Cell: 020-25501000",
            },
        }


adaptive_response_service = AdaptiveResponseService()
