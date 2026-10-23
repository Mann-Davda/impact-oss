"use client";

import React, { useState, useEffect } from "react";
import { User, Users, Landmark, Newspaper, Navigation, CheckCircle, ShieldAlert, Copy, Check } from "lucide-react";
import { fetchAdaptiveResponse, AdaptiveResponseData } from "../lib/api";

interface AdaptiveResponseViewProps {
  incidentId: string;
}

export function AdaptiveResponseView({ incidentId }: AdaptiveResponseViewProps) {
  const [data, setData] = useState<AdaptiveResponseData | null>(null);
  const [activeTab, setActiveTab] = useState<"citizen" | "volunteer" | "government" | "media">("citizen");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdaptiveResponse(incidentId);
        setData(res);
      } catch (e) {
        console.error("Adaptive response load failed:", e);
      }
    }
    load();
  }, [incidentId]);

  if (!data) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary dark:text-white" />
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              Adaptive Multi-Persona Crisis Response
            </h2>
          </div>
          <span className="text-[10px] text-slate-500">
            One verified incident transformed into tailored operational packages for 4 distinct stakeholders.
          </span>
        </div>

        {/* Persona Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border-light dark:border-border-dark">
          <button
            onClick={() => setActiveTab("citizen")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "citizen"
                ? "bg-white dark:bg-[#111B2E] text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Citizen
          </button>

          <button
            onClick={() => setActiveTab("volunteer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "volunteer"
                ? "bg-white dark:bg-[#111B2E] text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Volunteer
          </button>

          <button
            onClick={() => setActiveTab("government")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "government"
                ? "bg-white dark:bg-[#111B2E] text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Government
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "media"
                ? "bg-white dark:bg-[#111B2E] text-primary dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" /> Media
          </button>
        </div>
      </div>

      {/* Tab 1: Citizen View */}
      {activeTab === "citizen" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase block mb-1">
              Designated Safe Evacuation Route
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {data.citizen.safe_route}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              <strong>Nearest Shelter:</strong> {data.citizen.designated_shelter}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                English Instructions
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {data.citizen.bilingual_instructions.en}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                मराठी सूचना (Marathi Instructions)
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {data.citizen.bilingual_instructions.mr}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Volunteer View */}
      {activeTab === "volunteer" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block mb-0.5">
                Designated Muster Coordinates
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {data.volunteer.muster_point}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-success text-white">
              Unit: {data.volunteer.assigned_unit}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
              Assigned Field Tasks
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-xs">
              {data.volunteer.tasks.map((task, idx) => (
                <li key={idx}>{task}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Government Commander View */}
      {activeTab === "government" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase block mb-0.5">
                Executive Status
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {data.government.operational_status} ({data.government.legal_statute})
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-primary dark:text-white">
              {data.government.projected_cost_allocation}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(data.government.resource_commitment).map(([key, val]) => (
              <div
                key={key}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark"
              >
                <span className="text-[10px] font-mono text-slate-400 capitalize block mb-1">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Media View */}
      {activeTab === "media" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-500">
                Verified Press Statement
              </span>
              <button
                onClick={() => handleCopy(data.media.official_statement)}
                className="text-[10px] font-bold text-primary dark:text-white flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Bulletin"}
              </button>
            </div>
            <p className="font-serif text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              "{data.media.official_statement}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border-light dark:border-border-dark">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
              Rumor Counter & Fact Check
            </span>
            <div className="space-y-1.5">
              {data.media.fact_check_box.map((fc, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark">
                  <span className="text-slate-600 dark:text-slate-400">Rumor: "{fc.rumor}"</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{fc.verdict}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
