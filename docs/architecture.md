# ImpactOS Architecture Specification

**Tagline:** From Chaos To Action.

ImpactOS is an AI decision-support system turning messy multimodal crisis information into verified, explainable, actionable response plans.

```
                      +---------------------------------------+
                      |       Multimodal Ingestion            |
                      |  [Photo] [Marathi Audio] [Text] [PDF] |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |            Intake Agent               |
                      | Multimodal classification & transcript|
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |            Intent Agent               |
                      | Urgency, Stakeholder, Tactical Action |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Verification Agent            |
                      | Cross-modal correlation & IMD sensor  |
                      | triangulation (Immutable Evidence DB) |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |             Risk Agent                |
                      | Threat level, escalation probability, |
                      | uncertainty bounds & Emergency Mode   |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |          Consensus Agent              |
                      | Weighted consensus, agreement analysis|
                      | & Confidence Evolution Timeline       |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Action Draft Engine           |
                      | Bilingual alerts (EN + Marathi)       |
                      | (Human-in-the-Loop Approval Required) |
                      +---------------------------------------+
```

## Non-Negotiable Rules Adherence
1. **No fabricated numbers**: All confidence, risk, and consensus scores are calculated from agent outputs. Mock/demo feeds are explicitly flagged `source: "mock"`.
2. **Uncertainty is mandatory**: Every risk assessment outputs `[confidence_min, confidence_max]` and explicit assumptions.
3. **Every AI output carries**: Confidence score, risk level, evidence list with timestamped sources, and concise reasoning summary.
4. **Human in the Loop**: All proposed alerts and tactical orders are created in `draft` status, requiring explicit human operator sign-off.
5. **Graceful failure**: Built-in fallback heuristics with explicit degraded state reporting.

## Database Schema (PostgreSQL / SQLite async)
- `incidents`: Primary crisis records, status, location, risk levels, and consensus scores.
- `inputs`: Raw ingested media (images, audio, texts, PDFs) with MIME types and paths.
- `agent_runs`: Audit telemetry for every agent step (name, duration_ms, input, output, confidence, rationale).
- `evidence`: Verified claims with supporting sources, confidence, and reasoning.
- `actions`: Generated bilingual actions and alerts requiring human approval.
- `resources`: Physical asset pool (NDRF boats, ambulances, shelters) with capacity and status.
