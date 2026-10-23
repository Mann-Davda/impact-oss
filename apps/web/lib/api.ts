export interface EvidenceItem {
  id: string;
  claim: string;
  verification_status: "verified" | "inconclusive" | "refuted";
  confidence: number;
  source: string;
  source_type: string;
  reasoning: string;
  timestamp: string;
}

export interface AgentRun {
  id: string;
  agent_name: string;
  phase: string;
  status: string;
  confidence: number;
  risk_level?: string;
  rationale: string;
  duration_ms: number;
  input_payload?: Record<string, unknown>;
  output_payload?: Record<string, unknown>;
  created_at: string;
}

export interface ActionItem {
  id: string;
  title: string;
  action_type: string;
  target_audience: string;
  priority: string;
  status: string;
  content_en: string;
  content_mr: string;
  requires_human_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface ConfidenceEvolutionStep {
  step: number;
  agent: string;
  label: string;
  score: number;
  timestamp: string;
  rationale: string;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  location_name: string;
  latitude: number;
  longitude: number;
  risk_level: "low" | "moderate" | "high" | "critical" | "unassessed";
  risk_score: number;
  consensus_score: number;
  confidence_min: number;
  confidence_max: number;
  is_emergency: boolean;
  emergency_rationale?: string;
  intent_summary: {
    primary_intent?: string;
    urgency?: string;
    stakeholder?: string;
    required_action?: string;
    resources_needed?: string[];
    priority?: string;
    rationale?: string;
  };
  confidence_evolution: ConfidenceEvolutionStep[];
  inputs: Array<{
    id: string;
    input_type: string;
    source: string;
    filename?: string;
    content_text?: string;
  }>;
  evidence: EvidenceItem[];
  agent_runs: AgentRun[];
  actions: ActionItem[];
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  timestamp: string;
  title: string;
  actor: string;
  confidence?: number;
  details: Record<string, unknown>;
}

export interface IncidentTimeline {
  incident_id: string;
  total_events: number;
  events: TimelineEvent[];
  confidence_evolution: ConfidenceEvolutionStep[];
}

export interface SimulationScenario {
  scenario_id: string;
  name: string;
  description: string;
  estimated_evacuation_time_mins: [number, number];
  estimated_people_rescued: [number, number];
  health_risk_exposure: string;
  assumptions: string[];
  confidence_score: number;
  recommendation: string;
  reasoning: string;
}

export interface SimulationResult {
  disclaimer: string;
  confidence_score: number;
  rationale: string;
  scenarios: SimulationScenario[];
}

export interface ResourceAllocation {
  demand: string;
  priority: string;
  assigned_resource_id: string;
  assigned_resource_name: string;
  resource_type: string;
  distance_km: number;
  eta_minutes: number;
  capacity_allocated: number;
  explainable_why: string;
  status: string;
}

export interface ResourceOptimizationResult {
  optimization_method: string;
  total_resources_evaluated: number;
  total_allocations: number;
  bottlenecks_detected: string;
  allocations: ResourceAllocation[];
}

export interface AdaptiveResponseData {
  citizen: {
    role_title: string;
    priority: string;
    safe_route: string;
    designated_shelter: string;
    bilingual_instructions: { en: string; mr: string };
    key_actions: string[];
  };
  volunteer: {
    role_title: string;
    priority: string;
    muster_point: string;
    assigned_unit: string;
    tasks: string[];
    safety_briefing: string;
  };
  government: {
    role_title: string;
    priority: string;
    operational_status: string;
    legal_statute: string;
    resource_commitment: Record<string, string>;
    projected_cost_allocation: string;
    next_milestone: string;
  };
  media: {
    role_title: string;
    priority: string;
    verified_headline: string;
    official_statement: string;
    fact_check_box: Array<{ rumor: string; verdict: string }>;
    spokesperson_contact: string;
  };
}

export interface CrisisDNADimension {
  dimension: string;
  value: string;
  index: number;
}

export interface CrisisDNAMatch {
  benchmark_id: string;
  name: string;
  location: string;
  year: number;
  similarity_score: number;
  similarity_percentage: string;
  peak_discharge_cusecs: number;
  outcome_summary: string;
  tactical_lesson: string;
}

export interface CrisisDNAResult {
  fingerprint_id: string;
  crisis_dna_vector: number[];
  dna_dimensions: CrisisDNADimension[];
  top_historical_match: CrisisDNAMatch | null;
  similar_incidents: CrisisDNAMatch[];
}

export interface ImpactMetrics {
  disclaimer: string;
  incident_id: string;
  calculated_at: string;
  headline_kpis: {
    people_protected_estimate: number;
    people_protected_range: [number, number];
    reports_verified: number;
    misinformation_claims_refuted: number;
    actions_executed: number;
    mean_response_time_minutes: number;
    resource_efficiency_score: number;
  };
  operational_breakdown: {
    boat_extractions_completed: number;
    shelter_intake_registered: number;
    als_ambulance_rendezvous: number;
    volunteer_cordon_checkpoints: number;
  };
  time_saved_vs_manual_triage_minutes: number;
  carbon_and_resource_strain: string;
}

export interface ActionApprovalResult {
  status: string;
  action_id: string;
  title: string;
  approved_by: string;
  approved_at: string;
}

export interface ExecuteActionsResult {
  incident_id: string;
  execution_status: string;
  operator: string;
  timestamp: string;
  total_actions_approved: number;
  actions: Array<{
    action_id: string;
    title: string;
    target_audience: string;
    bilingual_en: string;
    bilingual_mr: string;
    status: string;
  }>;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
  return res.json();
}

export async function fetchIncident(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch incident ${id}: ${res.statusText}`);
  return res.json();
}

export async function fetchIncidentTimeline(id: string): Promise<IncidentTimeline> {
  const res = await fetch(`${API_BASE}/incidents/${id}/timeline`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch timeline for ${id}: ${res.statusText}`);
  return res.json();
}

export async function triggerPuneDemo(): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error(`Demo trigger failed: ${res.statusText}`);
  return res.json();
}

export async function submitCustomIncident(formData: FormData): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) throw new Error(`Incident creation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSimulation(incidentId: string, customQuery?: string): Promise<SimulationResult> {
  const url = `${API_BASE}/incidents/${incidentId}/simulate${customQuery ? `?custom_query=${encodeURIComponent(customQuery)}` : ''}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchResourceOptimization(incidentId: string): Promise<ResourceOptimizationResult> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/optimize-resources`);
  if (!res.ok) throw new Error(`Resource optimization failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAdaptiveResponse(incidentId: string): Promise<AdaptiveResponseData> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/adaptive-response`);
  if (!res.ok) throw new Error(`Adaptive response failed: ${res.statusText}`);
  return res.json();
}

export async function executeAllActions(incidentId: string, operatorName: string = "Commander (One-Click Execute)"): Promise<ExecuteActionsResult> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/actions/execute-all?operator_name=${encodeURIComponent(operatorName)}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Action execution failed: ${res.statusText}`);
  return res.json();
}

export async function approveSingleAction(incidentId: string, actionId: string, operatorName: string = "Incident Commander"): Promise<ActionApprovalResult> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/actions/${actionId}/approve?operator_name=${encodeURIComponent(operatorName)}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Action approval failed: ${res.statusText}`);
  return res.json();
}

export async function fetchImpactMetrics(incidentId: string): Promise<ImpactMetrics> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/impact`);
  if (!res.ok) throw new Error(`Impact fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCrisisDNA(incidentId: string): Promise<CrisisDNAResult> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/crisis-dna`);
  if (!res.ok) throw new Error(`Crisis DNA fetch failed: ${res.statusText}`);
  return res.json();
}
