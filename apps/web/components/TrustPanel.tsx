"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Incident, EvidenceItem } from "../lib/api";

interface TrustPanelProps {
  incident: Incident;
}

export function TrustPanel({ incident }: TrustPanelProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const toggleEvidence = (id: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "inconclusive":
        return <HelpCircle className="w-4 h-4 text-alert" />;
      case "refuted":
        return <XCircle className="w-4 h-4 text-critical" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase bg-critical text-white shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            CRITICAL THREAT
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase bg-alert text-slate-900 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH THREAT
          </span>
        );
      case "moderate":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase bg-success text-white">
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="spatial-card p-5 flex flex-col gap-5">
      {/* Panel Title & Trust Anchor */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
            Trust & Risk Verification Panel
          </h2>
        </div>
        <div>{getRiskBadge(incident.risk_level)}</div>
      </div>

      {/* Metrics Row: Risk, Consensus, Uncertainty */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Risk Score */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Risk Score
          </span>
          <div className="text-2xl font-black text-critical mt-0.5">
            {(incident.risk_score * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">Severity Metric</span>
        </div>

        {/* Consensus Confidence */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Consensus Confidence
          </span>
          <div className="text-2xl font-black text-primary dark:text-slate-100 mt-0.5">
            {(incident.consensus_score * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">Multi-Agent Agreement</span>
        </div>

        {/* Mandatory Uncertainty Range */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Confidence Bounds
          </span>
          <div className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">
            {(incident.confidence_min * 100).toFixed(0)}% – {(incident.confidence_max * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] font-medium text-slate-400">Uncertainty Range</span>
        </div>
      </div>

      {/* Evidence List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Verified Evidence List ({incident.evidence.length} Claims Verified)
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Auditable Chain of Custody
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {incident.evidence.map((evi) => {
            const isExpanded = expandedEvidence[evi.id] ?? false;
            const isMock = evi.source_type === "mock" || evi.source.includes("DEMO DATA");

            return (
              <div
                key={evi.id}
                className="rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0E1726] p-3 text-xs shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div
                  className="flex items-start justify-between cursor-pointer gap-2"
                  onClick={() => toggleEvidence(evi.id)}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{getStatusIcon(evi.verification_status)}</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {evi.claim}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] text-slate-500">
                          Source: {evi.source}
                        </span>
                        {isMock && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span className="font-mono font-bold text-success">
                      {(evi.confidence * 100).toFixed(0)}%
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Reasoning:</strong>{" "}
                      {evi.reasoning}
                    </p>
                    <p className="font-mono text-[10px] text-slate-400 mt-1">
                      Verified Timestamp: {new Date(evi.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
