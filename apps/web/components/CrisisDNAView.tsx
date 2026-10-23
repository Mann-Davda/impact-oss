"use client";

import React, { useState, useEffect } from "react";
import { Dna, History, ArrowRight, CheckCircle, Info, Sparkles, AlertTriangle } from "lucide-react";
import { fetchCrisisDNA } from "../lib/api";

interface CrisisDNAViewProps {
  incidentId: string;
}

export function CrisisDNAView({ incidentId }: CrisisDNAViewProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchCrisisDNA(incidentId);
        setData(res);
      } catch (e) {
        console.error("Crisis DNA load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [incidentId]);

  if (loading || !data) return null;

  const topMatch = data.top_historical_match;
  const dimensions = data.dna_dimensions || [];
  const similarList = data.similar_incidents || [];

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-indigo-500" />
          <div>
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              Crisis DNA & Historical Precedent Matcher
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              Fingerprint: {data.fingerprint_id} • 8-Dimensional Cosine Similarity Matching
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
          DISASTER VECTOR EMBEDDING
        </span>
      </div>

      {/* 8-Dimensional Fingerprint Grid */}
      <div>
        <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-2">
          Crisis DNA Vector Representation
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {dimensions.map((dim: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark text-xs flex flex-col justify-between"
            >
              <span className="text-[10px] text-slate-400 font-semibold">{dim.dimension}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                {dim.value}
              </span>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full"
                  style={{ width: `${Math.round(dim.index * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Historical Match Callout */}
      {topMatch && (
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
              <History className="w-4 h-4 text-indigo-600" />
              Nearest Historical Disaster Benchmark: {topMatch.name} ({topMatch.year})
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-indigo-600 text-white">
              {topMatch.similarity_percentage} Vector Match
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300">
            <strong>Historical Precedent:</strong> {topMatch.outcome_summary}
          </p>

          <div className="mt-2.5 pt-2 border-t border-indigo-200/50 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-200">
            <strong>Institutional Tactical Lesson:</strong> {topMatch.tactical_lesson}
          </div>
        </div>
      )}

      {/* Other Benchmark Incidents Table */}
      <div>
        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
          Comparative Historical Benchmark Library
        </span>
        <div className="space-y-1.5">
          {similarList.slice(1).map((item: any) => (
            <div
              key={item.benchmark_id}
              className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-border-light dark:border-border-dark flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono ml-2">
                  {item.location} • Peak Discharge: {item.peak_discharge_cusecs?.toLocaleString()} cusecs
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">
                {item.similarity_percentage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
