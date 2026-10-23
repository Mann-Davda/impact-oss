"use client";

import React from "react";
import { GitMerge, CheckCircle, AlertCircle, HelpCircle, TrendingUp, Sparkles } from "lucide-react";
import { Incident } from "../lib/api";
import { useLocale } from "../lib/locale";

interface ConsensusPanelProps {
  incident: Incident;
  onOpenExplainability: () => void;
}

export function ConsensusPanel({ incident, onOpenExplainability }: ConsensusPanelProps) {
  const { t } = useLocale();
  // Extract per-agent runs
  const agentMap: Record<string, number> = {};
  for (const step of incident.confidence_evolution || []) {
    agentMap[step.agent] = step.score;
  }

  // Fallback defaults if not parsed
  const intakeScore = agentMap["intake"] ?? 0.75;
  const intentScore = agentMap["intent"] ?? 0.85;
  const verifyScore = agentMap["verification"] ?? 0.91;
  const riskScore = agentMap["risk"] ?? 0.90;
  const consensusScore = incident.consensus_score;

  return (
    <div className="spatial-card p-5 flex flex-col gap-5">
      {/* Panel Header & Explainability Replay Button */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-alert" />
          <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
            {t("Multi-Agent Consensus & Evolution")}
          </h2>
        </div>

        {/* Explainability "Why?" Button */}
        <button
          onClick={onOpenExplainability}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-alert" />
          {t("Why? (Explainability Replay)")}
        </button>
      </div>

      {/* Per-Agent Scores Bar */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
          {t("Per-Agent Epistemic Confidence")}
        </span>
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-semibold text-slate-400 block">{t("Intake")}</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200">
              {(intakeScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-semibold text-slate-400 block">{t("Intent")}</span>
            <span className="text-base font-black text-slate-800 dark:text-slate-200">
              {(intentScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-semibold text-slate-400 block">{t("Verify")}</span>
            <span className="text-base font-black text-success">
              {(verifyScore * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-semibold text-slate-400 block">{t("Risk")}</span>
            <span className="text-base font-black text-critical">
              {(riskScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Evolution Timeline / Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-success" /> {t("Confidence Evolution Over Time")}
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Final: {(consensusScore * 100).toFixed(1)}%
          </span>
        </div>

        <div className="relative pt-2 pb-1">
          {/* Connecting Line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0"></div>

          <div className="relative z-10 flex justify-between">
            {(incident.confidence_evolution || []).map((step) => (
              <div key={step.step} className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-white dark:bg-[#111B2E] border-2 border-primary dark:border-slate-300 flex items-center justify-center font-mono text-[10px] font-black text-primary dark:text-slate-200 shadow-sm">
                  {step.step}
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 capitalize">
                  {step.agent}
                </span>
                <span className="font-mono text-[10px] font-semibold text-success">
                  {(step.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agreement & Disagreement Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Agreements */}
        <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {t("Consensus Agreement Factors")}
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
            <li>Unanimous confirmation of severe Mutha river inundation at Bund Garden.</li>
            <li>Direct distress audio confirms trapped elderly resident requiring evacuation.</li>
            <li>Danger mark exceeded (+1.32m) with active Khadakwasla upstream release.</li>
          </ul>
        </div>

        {/* Disagreements / Epistemic Variances */}
        <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            {t("Epistemic Variances & Uncertainties")}
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
            <li>Ground photo captures river channel; audio call describes ground-floor indoor flooding nearby.</li>
            <li>IMD regional warning is broad, while Mutha sensor gauge confirms localized rapid level rise.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
