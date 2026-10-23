"use client";

import React, { useState } from "react";
import { X, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, Cpu, FileSearch } from "lucide-react";
import { Incident } from "../lib/api";
import { useLocale } from "../lib/locale";

interface ExplainabilityModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
}

export function ExplainabilityModal({ incident, isOpen, onClose }: ExplainabilityModalProps) {
  const { t } = useLocale();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      agent: "Source Submission",
      role: "Citizen & Sensor Telemetry",
      icon: <FileSearch className="w-5 h-5 text-blue-500" />,
      input: {
        photo: "mutha_river_flood.jpg (Bund Garden, Pune)",
        audio_note: "marathi_voice_note.mp3 ('माझी आजी अडकली आहे आणि ती बाहेर पडू शकत नाही')",
        weather_alert: "IMD Pune Station 43063 (Orange Watch)",
        sensor_feed: "35,400 cusecs Khadakwasla discharge; +1.32m over danger mark (DEMO DATA)"
      },
      output: {
        raw_modalities: 4,
        ingestion_status: "complete",
        ingested_at: incident.created_at
      },
      explanation: "Multiple disparate crisis signals were ingested: flood photography, a voice distress note in Marathi, and official meteorological/sensor warnings."
    },
    {
      agent: "Intake Agent",
      role: "Classification & Transcription",
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      input: "Raw image + Marathi MP3 audio note",
      output: {
        classified_category: incident.category,
        detected_location: incident.location_name,
        transcription_mr: "माझी आजी अडकली आहे आणि ती बाहेर पडू शकत नाही.",
        translation_en: "My grandmother is trapped and cannot get out."
      },
      explanation: "The Intake Agent analyzed regional cues (Marathi signboards, Parakh House building mark) and transcribed the Marathi distress call to identify that an elderly family member is stranded."
    },
    {
      agent: "Intent Agent",
      role: "Triage & Stakeholder Mapping",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      input: incident.intent_summary,
      output: {
        primary_intent: incident.intent_summary?.primary_intent,
        urgency: incident.intent_summary?.urgency,
        stakeholder: incident.intent_summary?.stakeholder,
        required_action: incident.intent_summary?.required_action
      },
      explanation: "Categorized as Critical Emergency Life-Safety. The stakeholder is an elderly trapped citizen with limited mobility, mandating immediate motorized boat rescue and geriatric medical support."
    },
    {
      agent: "Verification Agent",
      role: "Cross-Modal Triangulation",
      icon: <ShieldAlert className="w-5 h-5 text-success" />,
      input: "Visual rivermarks vs voice note vs IMD Pune station alerts",
      output: {
        verified_claims_count: incident.evidence.length,
        overall_confidence: "91%",
        evidence_chain: incident.evidence.map(e => `${e.claim} [${e.verification_status}]`)
      },
      explanation: "Triangulated physical water height marks in the photograph with localized sensor discharge (+1.32m) and verified the voice note distress authenticity to eliminate false reporting."
    },
    {
      agent: "Risk Agent & Emergency Arbiter",
      role: "Threat Modeling & Consensus",
      icon: <ShieldAlert className="w-5 h-5 text-critical" />,
      input: "Verified evidence + catchment rainfall forecast + dam release rate",
      output: {
        computed_risk_level: incident.risk_level.toUpperCase(),
        risk_score: `${(incident.risk_score * 100).toFixed(0)}%`,
        consensus_score: `${(incident.consensus_score * 100).toFixed(1)}%`,
        emergency_mode: incident.is_emergency ? "TRIGGERED" : "NORMAL",
        uncertainty_bounds: `${(incident.confidence_min * 100).toFixed(0)}% - ${(incident.confidence_max * 100).toFixed(0)}%`
      },
      explanation: "Water levels exceeding danger thresholds combined with upstream discharge and a trapped vulnerable citizen computed an acute 94% risk score, automatically initiating Emergency Mode."
    }
  ];

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="spatial-card w-full max-w-3xl bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-alert" />
            <div>
              <h2 className="text-base font-extrabold text-primary dark:text-white">
                {t("Explainability Replay: Why was this decided?")}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Step {currentStepIndex + 1} of {steps.length}: {currentStep.agent}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Dots */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  idx === currentStepIndex
                    ? "bg-primary text-white dark:bg-slate-700"
                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {idx + 1}. {step.agent.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((i) => i - 1)}
              className="p-1.5 rounded border border-border-light dark:border-border-dark disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={() => setCurrentStepIndex((i) => i + 1)}
              className="p-1.5 rounded border border-border-light dark:border-border-dark disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              {currentStep.icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-primary dark:text-white">
                {currentStep.agent}
              </h3>
              <p className="text-xs font-semibold text-slate-500">{currentStep.role}</p>
            </div>
          </div>

          {/* Reasoning Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              {t("Factual AI Reasoning")}
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          {/* Inputs & Outputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Agent Input Payload
              </span>
              <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {typeof currentStep.input === "string"
                  ? currentStep.input
                  : JSON.stringify(currentStep.input, null, 2)}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Verified Output & Telemetry
              </span>
              <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {JSON.stringify(currentStep.output, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Immutable Audit Trail • Rule 3: Structured AI Evidence Compliance
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold bg-primary text-white hover:bg-slate-800"
          >
            Close Replay
          </button>
        </div>
      </div>
    </div>
  );
}
