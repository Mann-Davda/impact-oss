"use client";

import React, { useState, useEffect } from "react";
import { Layers, ShieldCheck, Navigation, Ambulance, Home, Users, CheckCircle, Info } from "lucide-react";
import { fetchResourceOptimization, ResourceOptimizationResult, ResourceAllocation } from "../lib/api";
import { useLocale } from "../lib/locale";

interface ResourceAllocationViewProps {
  incidentId: string;
}

export function ResourceAllocationView({ incidentId }: ResourceAllocationViewProps) {
  const { t } = useLocale();
  const [data, setData] = useState<ResourceOptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllocations() {
      try {
        const res = await fetchResourceOptimization(incidentId);
        setData(res);
      } catch (e) {
        console.error("Failed to load resource allocations:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAllocations();
  }, [incidentId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "rescue_boat":
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case "ambulance":
        return <Ambulance className="w-4 h-4 text-purple-500" />;
      case "shelter":
        return <Home className="w-4 h-4 text-success" />;
      default:
        return <Users className="w-4 h-4 text-alert" />;
    }
  };

  if (loading) {
    return (
      <div className="spatial-card p-6 text-center text-xs text-slate-400">
        {t("Computing Explainable Linear Resource Allocation...")}
      </div>
    );
  }

  const allocations = data?.allocations || [];

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-success" />
          <div>
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              {t("Explainable Resource Optimization Engine")}
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Method: Priority-Constrained Greedy Matching • {data?.total_resources_evaluated || 6} Tactical Assets Evaluated
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
          {t("DEMO DATA (mock)")}
        </span>
      </div>

      {/* Allocation Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  {getIcon(item.resource_type)}
                  {item.assigned_resource_name}
                </span>
                <span className="font-mono text-[10px] font-bold text-success px-2 py-0.5 rounded bg-success/10 border border-success/30">
                  ETA: {item.eta_minutes} mins
                </span>
              </div>

              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <strong>{t("Assigned Mission:")}</strong> {item.demand}
              </p>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                <span>Distance: {item.distance_km} km</span>
                <span>•</span>
                <span>Capacity: {item.capacity_allocated} units</span>
                <span>•</span>
                <span className="font-bold uppercase text-critical">Priority: {item.priority}</span>
              </div>
            </div>

            {/* Explainable Why */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark text-[11px] text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">{t("Why Selected:")}</strong>{" "}
              {item.explainable_why}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
