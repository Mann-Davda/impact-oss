"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { fetchSimulation, getErrorMessage, SimulationResult } from "../lib/api";
import { useLocale } from "../lib/locale";

interface SimulationViewProps {
  incidentId: string;
}

export function SimulationView({ incidentId }: SimulationViewProps) {
  const { t } = useLocale();
  const [customQuery, setCustomQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async (query?: string) => {
    setIsSimulating(true);
    try {
      const res = await fetchSimulation(incidentId, query || customQuery);
      setResult(res);
    } catch (e: unknown) {
      alert(`Simulation error: ${getErrorMessage(e)}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-alert" />
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              {t("Scenario Simulation & Counterfactual Modeler")}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-amber-500 uppercase mt-0.5 block">
            {t(result?.disclaimer ?? "No simulation results yet.")}
          </span>
        </div>

        {result && result.scenarios.length > 0 && (
          <span className="text-xs font-mono font-bold text-slate-500">
            {t("Model Confidence:")} {(result.confidence_score * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Interactive What-If Query Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder={t("Ask a what-if query (e.g. 'What if Khadakwasla discharge increases to 50,000 cusecs?')...")}
          className="flex-1 bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none"
        />
        <button
          onClick={() => handleRunSimulation(customQuery)}
          disabled={isSimulating}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? t("Evaluating...") : t("Run Scenario Simulation")}
        </button>
      </div>

      {/* 3 Comparative Scenario Cards */}
      {result && result.scenarios.length === 0 && (
        <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          {t("Simulation is unavailable; no scenario estimates were generated.")}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result?.scenarios.map((sc) => {
          const isRec = sc.recommendation.includes("RECOMMENDED") && !sc.recommendation.includes("NOT");
          const isBad = sc.recommendation.includes("NOT");

          return (
            <div
              key={sc.scenario_id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                isRec
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : isBad
                  ? "bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800"
                  : "bg-slate-50 dark:bg-slate-900 border-border-light dark:border-border-dark"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      isRec
                        ? "bg-success text-white"
                        : isBad
                        ? "bg-critical text-white"
                        : "bg-alert text-slate-900"
                    }`}
                  >
                    {sc.recommendation}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {(sc.confidence_score * 100).toFixed(0)}% Conf
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                  {sc.name}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {sc.description}
                </p>

                {/* Outcome Ranges */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-lg bg-white/80 dark:bg-[#111B2E]/80 border border-slate-200 dark:border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-bold">{t("Evacuation Time")}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {sc.estimated_evacuation_time_mins[0]} – {sc.estimated_evacuation_time_mins[1]} mins
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">{t("Health Risk")}</span>
                    <span
                      className={`font-bold capitalize ${
                        sc.health_risk_exposure === "minimal"
                          ? "text-success"
                          : sc.health_risk_exposure === "severe"
                          ? "text-critical"
                          : "text-alert"
                      }`}
                    >
                      {sc.health_risk_exposure}
                    </span>
                  </div>
                </div>

                {/* Mandatory Assumptions List */}
                <div className="mt-3">
                  <span className="text-[9px] font-extrabold uppercase text-slate-500 block mb-1">
                    Stated Assumptions (Mandatory Rule)
                  </span>
                  <ul className="list-disc pl-3 text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    {sc.assumptions.map((asm, idx) => (
                      <li key={idx}>{asm}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Rationale Footer */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 italic">
                {sc.reasoning}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
