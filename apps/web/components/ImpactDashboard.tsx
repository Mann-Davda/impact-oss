"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Users, CheckCircle, Clock, ShieldCheck, Zap, Info } from "lucide-react";
import { fetchImpactMetrics } from "../lib/api";

interface ImpactDashboardProps {
  incidentId: string;
}

export function ImpactDashboard({ incidentId }: ImpactDashboardProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchImpactMetrics(incidentId);
        setData(res);
      } catch (e) {
        console.error("Impact load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [incidentId]);

  if (loading || !data) return null;

  const kpis = data.headline_kpis || {};
  const breakdown = data.operational_breakdown || {};

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-success" />
          <div>
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              Operational Impact & Crisis KPIs
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Post-Action Audit & Efficacy Metrics
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
          DEMO DATA: SIMULATED IMPACT OUTCOMES
        </span>
      </div>

      {/* 4 Minimalist KPI Metric Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: People Helped */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">People Protected</span>
            <Users className="w-4 h-4 text-primary dark:text-white" />
          </div>
          <div className="text-2xl font-black text-primary dark:text-white">
            {kpis.people_protected_estimate}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Range: {kpis.people_protected_range?.[0]}–{kpis.people_protected_range?.[1]} citizens
          </span>
        </div>

        {/* KPI 2: Reports Verified */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Reports Verified</span>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-black text-success">
            {kpis.reports_verified}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            {kpis.misinformation_claims_refuted} rumors refuted
          </span>
        </div>

        {/* KPI 3: Actions Executed */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Actions Executed</span>
            <Zap className="w-4 h-4 text-alert" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {kpis.actions_executed}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            100% Human-Approved
          </span>
        </div>

        {/* KPI 4: Mean Response Time */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Response Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {kpis.mean_response_time_minutes} m
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Saved: {data.time_saved_vs_manual_triage_minutes}m vs manual
          </span>
        </div>
      </div>

      {/* Operational Breakdown Bar */}
      <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-border-light dark:border-border-dark text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Amphibious Extractions</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {breakdown.boat_extractions_completed} Priority Mission (Elderly Aaji)
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Shelter Intakes</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {breakdown.shelter_intake_registered} Residents (St. Helena)
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-bold">ALS Ambulance Units</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {breakdown.als_ambulance_rendezvous} Staged Unit (ALS-02)
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 self-end sm:self-auto">
          Efficiency: {(kpis.resource_efficiency_score * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
