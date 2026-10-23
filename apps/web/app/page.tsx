"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { TrustPanel } from "../components/TrustPanel";
import { ConsensusPanel } from "../components/ConsensusPanel";
import { AITimeline } from "../components/AITimeline";
import { IncidentMap } from "../components/IncidentMap";
import { IncidentSubmission } from "../components/IncidentSubmission";
import { ExplainabilityModal } from "../components/ExplainabilityModal";
import { AskImpactOSCopilot } from "../components/AskImpactOSCopilot";
import { DecisionGraph } from "../components/DecisionGraph";
import { SimulationView } from "../components/SimulationView";
import { ResourceAllocationView } from "../components/ResourceAllocationView";
import { AdaptiveResponseView } from "../components/AdaptiveResponseView";
import { ImpactDashboard } from "../components/ImpactDashboard";
import { CrisisDNAView } from "../components/CrisisDNAView";
import { MobilePWAView } from "../components/MobilePWAView";
import { EmergencyHelp } from "../components/EmergencyHelp";
import Link from "next/link";
import Image from "next/image";
import {
  fetchIncidents,
  fetchIncident,
  fetchIncidentTimeline,
  triggerPuneDemo,
  executeAllActions,
  approveSingleAction,
  getErrorMessage,
  Incident,
  IncidentTimeline
} from "../lib/api";
import { useLocale } from "../lib/locale";
import {
  AlertTriangle,
  Clock,
  CloudRain,
  MapPin,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
  Zap
} from "lucide-react";

export default function CommandCenterPage() {
  const { t } = useLocale();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<IncidentTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showExplainability, setShowExplainability] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [approvedActions, setApprovedActions] = useState<Record<string, boolean>>({});
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [showPwaMobile, setShowPwaMobile] = useState(false);

  // Initial load: Fetch incidents or trigger demo if empty
  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await fetchIncidents();
      if (list && list.length > 0) {
        setIncidents(list);
        const latest = list[0];
        setActiveIncident(latest);
        const t = await fetchIncidentTimeline(latest.id);
        setTimeline(t);
      } else {
        const demo = await triggerPuneDemo();
        setIncidents([demo]);
        setActiveIncident(demo);
        const t = await fetchIncidentTimeline(demo.id);
        setTimeline(t);
      }
    } catch (err) {
      console.error("Failed to load initial data, triggering demo fallback...", err);
      try {
        const demo = await triggerPuneDemo();
        setIncidents([demo]);
        setActiveIncident(demo);
        const t = await fetchIncidentTimeline(demo.id);
        setTimeline(t);
      } catch (e) {
        console.error("Demo fallback error:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectIncident = async (inc: Incident) => {
    setActiveIncident(inc);
    try {
      const t = await fetchIncidentTimeline(inc.id);
      setTimeline(t);
    } catch (e) {
      console.error("Timeline error:", e);
    }
  };

  const handleIncidentCreated = async (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev]);
    setActiveIncident(newInc);
    try {
      const t = await fetchIncidentTimeline(newInc.id);
      setTimeline(t);
    } catch (e) {
      console.error("Timeline error:", e);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    if (!activeIncident) return;
    try {
      await approveSingleAction(activeIncident.id, actionId);
      setApprovedActions((prev) => ({ ...prev, [actionId]: true }));
      alert("Tactical response draft approved by Human Operator. Logged to audit trail.");
    } catch (e: unknown) {
      alert(`Approval error: ${getErrorMessage(e)}`);
    }
  };

  const handleExecuteAll = async () => {
    if (!activeIncident) return;
    setIsExecutingAll(true);
    try {
      const res = await executeAllActions(activeIncident.id, "Commander (One-Click Execute)");
      const updatedMap: Record<string, boolean> = {};
      for (const act of activeIncident.actions) {
        updatedMap[act.id] = true;
      }
      setApprovedActions(updatedMap);
      alert(`${res.total_actions_approved} drafts approved and logged. No external alerts or dispatches were sent.`);
    } catch (e: unknown) {
      alert(`Execution error: ${getErrorMessage(e)}`);
    } finally {
      setIsExecutingAll(false);
    }
  };

  if (!activeIncident) {
    if (!isLoading) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-slate-900 dark:text-white">
          <h1 className="text-xl font-bold">{t("Command center data is unavailable.")}</h1>
          <p role="alert" className="max-w-lg text-sm text-slate-600 dark:text-slate-300">
            {t("Unable to load the incident and the demo fallback. Check the API connection before continuing.")}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="min-h-11 rounded-lg bg-primary px-5 py-2 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("Retry")}
          </button>
        </main>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-black text-2xl mb-4 animate-bounce">
          Ω
        </div>
        <h2 className="text-xl font-bold">Synchronizing ImpactOS Command Center...</h2>
        <p className="text-sm text-slate-400 mt-1">Connecting to Multi-Agent Decision Support Pipeline</p>
      </div>
    );
  }

  const isEmergency = activeIncident.is_emergency && !manualOverride;

  return (
    <div className={`min-h-screen flex flex-col ${isEmergency ? "emergency-mode" : ""}`}>
      {/* Top Header */}
      <Header
        isEmergency={activeIncident.is_emergency}
        manualOverride={manualOverride}
        onToggleOverride={() => setManualOverride(!manualOverride)}
        onRefresh={loadData}
        isLoading={isLoading}
      />

      {/* Emergency Mode Banner (Auto-switched on Critical) */}
      <EmergencyBanner
        incident={activeIncident}
        manualOverride={manualOverride}
        onToggleOverride={() => setManualOverride(!manualOverride)}
      />

      {activeIncident.status === "degraded" && (
        <div role="alert" className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-7xl rounded-xl border border-amber-500 bg-amber-50 p-4 text-sm font-semibold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          {t("AI analysis is unavailable. This incident is unassessed; do not treat it as safe. No action plan was generated.")}
        </div>
      )}

      <EmergencyHelp />

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Top Control Bar: Incident Switcher, Report Ingest, & One-Click Execute */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <label htmlFor="active-incident" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {t("Active Crisis Incident:")}
            </label>
            <select
              id="active-incident"
              value={activeIncident.id}
              onChange={(e) => {
                const found = incidents.find((i) => i.id === e.target.value);
                if (found) handleSelectIncident(found);
              }}
              className="w-full min-w-0 sm:max-w-full text-xs font-bold bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-primary dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-alert"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.risk_level.toUpperCase()}] {inc.title} ({new Date(inc.created_at).toLocaleTimeString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:w-auto xl:flex-nowrap">
            {/* Landing Story Link */}
            <Link
              href="/landing"
              className="min-w-0 justify-center px-2 sm:px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-alert" />
              {t("Storytelling View")}
            </Link>

            {/* Pocket PWA Toggle */}
            <button
              onClick={() => setShowPwaMobile(!showPwaMobile)}
              className="min-w-0 justify-center px-2 sm:px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] sm:text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t("Pocket PWA")}
            </button>

            {/* One-Click Execute Response Button */}
            <button
              onClick={handleExecuteAll}
              disabled={isExecutingAll}
              className="min-w-0 justify-center px-2 sm:px-4 py-2 rounded-xl bg-critical text-white font-black text-[10px] sm:text-xs uppercase tracking-wide flex items-center gap-2 hover:bg-red-700 shadow-spatial-sm transition-all"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              {isExecutingAll ? t("Executing...") : t("Execute Approved Response")}
            </button>

            <button
              onClick={() => setShowSubmission(!showSubmission)}
              className="min-w-0 justify-center px-2 sm:px-4 py-2 rounded-xl bg-primary text-white font-bold text-[10px] sm:text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-spatial-sm"
            >
              <UploadCloud className="w-4 h-4 text-alert" />
              {showSubmission ? t("Hide Ingestion") : t("Submit Crisis Report")}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile PWA View */}
        {showPwaMobile && (
          <div className="mb-2">
            <MobilePWAView onClose={() => setShowPwaMobile(false)} />
          </div>
        )}

        {/* Collapsible Incident Ingestion Screen */}
        {showSubmission && (
          <IncidentSubmission
            onIncidentCreated={handleIncidentCreated}
            onClose={() => setShowSubmission(false)}
          />
        )}

        {/* Phase 3 Centerpiece: Universal Action & Decision Graph */}
        <DecisionGraph incident={activeIncident} />

        {/* Functional Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tile 1: Incident Summary & Raw Ingested Modalities (Col-span 2) */}
          <div className="spatial-card p-6 lg:col-span-2 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-light dark:border-border-dark pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-primary dark:text-white">
                    {activeIncident.title}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {activeIncident.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-critical" />
                  {activeIncident.location_name} • Reported at{" "}
                  {new Date(activeIncident.created_at).toLocaleString()}
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                ID: {activeIncident.id}
              </span>
            </div>

            {/* Situational Context & Marathi Audio Transcript */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Flood Photo Preview */}
              <div className="relative rounded-xl overflow-hidden border border-border-light dark:border-border-dark bg-slate-900 group">
                <Image
                  src="/mutha_river_flood.jpg"
                  alt="Mutha River flood Bund Garden Pune"
                  width={1024}
                  height={256}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md rounded p-1.5 text-[10px] text-white flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-alert" /> Bund Garden, Mutha River
                  </span>
                  <span className="font-mono text-slate-300">18.5424°N, 73.8837°E</span>
                </div>
              </div>

              {/* Marathi Voice Note & Translation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-alert" /> Marathi Audio Distress Note
                    </span>
                    <span className="text-[9px] font-mono text-success font-bold">{t("TRANSCRIBED")}</span>
                  </div>

                  <div className="p-2.5 rounded bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      &quot;माझी आजी अडकली आहे आणि ती बाहेर पडू शकत नाही.&quot;
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      &quot;My grandmother is trapped and cannot get out.&quot;
                    </p>
                  </div>

                  <audio controls className="w-full h-8 mt-2.5">
                    <source src="/marathi_voice_note.mp3" type="audio/mp3" />
                  </audio>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{t("Stakeholder: Trapped Elderly Citizen")}</span>
                  <span className="font-bold text-critical uppercase">{t("Critical Triage")}</span>
                </div>
              </div>
            </div>

            {/* Operational Intent */}
            <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-slate-800/40 border border-primary/20 dark:border-slate-700 text-xs">
              <span className="font-bold text-primary dark:text-slate-200 block mb-1">
                {t("Operational Intent:")} {activeIncident.intent_summary?.primary_intent || t("Emergency Life Safety & Rescue")}
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                <strong>{t("Required Action:")}</strong> {activeIncident.intent_summary?.required_action}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                <strong>{t("Allocated Resources Needed:")}</strong>{" "}
                {activeIncident.intent_summary?.resources_needed?.join(", ") || "NDRF Inflatable Rescue Boat, ALS Ambulance, PMC Shelter Registration"}
              </p>
            </div>
          </div>

          {/* Tile 2: Weather & River Gauge Bento Tile (Col-span 1) */}
          <div className="spatial-card p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xs font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
                    {t("Weather & River Gauge")}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">IMD 43063</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs mb-3">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase block">
                  {t("Official Warning: IMD Station 43063 (Pune)")}
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {t("Yellow/Orange Watch for Catchment Inflow & Local Heavy Showers")}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {t("Bund Garden River Gauge")}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40">
                    DEMO DATA
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-critical">7.82 m</span>
                  <span className="text-xs text-slate-500 font-medium">{t("Danger Mark: 6.50 m")}</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-critical h-full w-[85%]"></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>{t("Dam Release: 35,400 cusecs")}</span>
                  <span className="text-critical font-bold">{t("+1.32m Overflow")}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowExplainability(true)}
              className="w-full py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 font-bold text-xs text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-alert" />
              {t('View Explainability Audit ("Why?")')}
            </button>
          </div>

          {/* Tile 3: Trust & Evidence Panel (Col-span 2) */}
          <div className="lg:col-span-2">
            <TrustPanel incident={activeIncident} />
          </div>

          {/* Tile 4: Multi-Agent Consensus & Evolution (Col-span 1) */}
          <div className="lg:col-span-1">
            <ConsensusPanel
              incident={activeIncident}
              onOpenExplainability={() => setShowExplainability(true)}
            />
          </div>

          {/* Phase 3 Component: Scenario Simulation View (Col-span 3) */}
          <div className="lg:col-span-3">
            <SimulationView incidentId={activeIncident.id} />
          </div>

          {/* Phase 3 Component: Explainable Resource Optimization (Col-span 3) */}
          <div className="lg:col-span-3">
            <ResourceAllocationView incidentId={activeIncident.id} />
          </div>

          {/* Phase 3 Component: Adaptive Multi-Persona Response (Col-span 3) */}
          <div className="lg:col-span-3">
            <AdaptiveResponseView incidentId={activeIncident.id} />
          </div>

          {/* Phase 4 Component: Operational Impact & KPIs (Col-span 3) */}
          <div className="lg:col-span-3">
            <ImpactDashboard incidentId={activeIncident.id} />
          </div>

          {/* Phase 4 Component: Crisis DNA & Historical Benchmarks (Col-span 3) */}
          <div className="lg:col-span-3">
            <CrisisDNAView incidentId={activeIncident.id} />
          </div>

          {/* Tile 5: Spatial Crisis Map (Col-span 2) */}
          <div className="lg:col-span-2">
            <IncidentMap incident={activeIncident} />
          </div>

          {/* Tile 6: AI Execution Timeline & Live Agent Activity (Col-span 1) */}
          <div className="lg:col-span-1">
            <AITimeline incident={activeIncident} timeline={timeline} />
          </div>

          {/* Tile 7: Human-in-the-Loop Actions Engine (Col-span 3) */}
          <div className="spatial-card p-6 lg:col-span-3 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary dark:text-white" />
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
                    {t("Draft Response Actions (Human-in-the-Loop Approval Required)")}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    {t("Rule 4: Nothing is transmitted externally without explicit operator sign-off.")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteAll}
                  disabled={isExecutingAll}
                  className="px-3 py-1.5 rounded-lg bg-critical text-white font-black text-xs uppercase flex items-center gap-1.5 hover:bg-red-700 shadow-sm transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  {t("Sign & Execute All Drafts")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeIncident.actions.map((act) => {
                const isApproved = approvedActions[act.id] ?? false;

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-critical/15 text-critical">
                          {act.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 capitalize">
                          {t("Audience:")} {act.target_audience}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {act.title}
                      </h4>

                      <div className="mt-2 space-y-2 text-xs">
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300">{t("English:")}</strong> {act.content_en}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                          <strong className="text-slate-700 dark:text-slate-300">मराठी:</strong> {act.content_mr}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {t("Status:")} {isApproved ? t("APPROVED (LOGGED)") : t("PENDING HUMAN APPROVAL")}
                      </span>

                      <button
                        onClick={() => handleApproveAction(act.id)}
                        disabled={isApproved}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isApproved
                            ? "bg-success text-white cursor-default"
                            : "bg-primary text-white hover:bg-slate-800 shadow-sm"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isApproved ? t("Approved & Logged") : t("Sign & Approve Draft")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Ask ImpactOS Copilot (Liquid Glass Accent) */}
      <AskImpactOSCopilot incident={activeIncident} />

      {/* Explainability Replay Modal */}
      <ExplainabilityModal
        incident={activeIncident}
        isOpen={showExplainability}
        onClose={() => setShowExplainability(false)}
      />
    </div>
  );
}
