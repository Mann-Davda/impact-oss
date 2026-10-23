"use client";

import React, { useState } from "react";
import { GitBranch, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, FileText, ArrowRight, Layers, Sparkles, Navigation, X } from "lucide-react";
import { Incident } from "../lib/api";

interface DecisionGraphProps {
  incident: Incident;
  onSelectAction?: (actionId: string) => void;
}

interface GraphNode {
  id: string;
  category: "intake" | "verify" | "risk" | "simulation" | "resource" | "action";
  label: string;
  status: "verified" | "active" | "critical" | "draft" | "approved";
  confidence: number;
  actor: string;
  evidenceSummary: string;
  reasoning: string;
  dependencies: string[];
}

export function DecisionGraph({ incident, onSelectAction }: DecisionGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Structured nodes forming the Universal Action Graph
  const nodes: GraphNode[] = [
    {
      id: "node_intake",
      category: "intake",
      label: "Multimodal Incident Ingestion",
      status: "verified",
      confidence: 0.75,
      actor: "Intake Agent",
      evidenceSummary: "Photo of swollen Mutha River + Marathi audio note ('माझी आजी अडकली आहे...') + Situational text.",
      reasoning: "Classified as riverine flood at Bund Garden corridor with localized Marathi distress speech.",
      dependencies: []
    },
    {
      id: "node_verify",
      category: "verify",
      label: "IMD Alert & River Sensor Triangulation",
      status: "verified",
      confidence: 0.91,
      actor: "Verification Agent",
      evidenceSummary: "Visual water line corroborates Bund Garden gauge at 7.82m (+1.32m over danger mark) with 35,400 cusecs dam release.",
      reasoning: "Multi-source triangulation verified 4 out of 4 claims. Eliminated false reports.",
      dependencies: ["node_intake"]
    },
    {
      id: "node_risk",
      category: "risk",
      label: "Compound Threat: CRITICAL EMERGENCY",
      status: "critical",
      confidence: 0.90,
      actor: "Risk Agent",
      evidenceSummary: "Fast-rising flood waters (14.5 cm/hr) + trapped elderly citizen with mobility constraints.",
      reasoning: "Risk score computed at 0.94 (Critical). Emergency Mode automatically activated.",
      dependencies: ["node_verify"]
    },
    {
      id: "node_simulation",
      category: "simulation",
      label: "Scenario Simulation (Act Now vs Delay)",
      status: "verified",
      confidence: 0.88,
      actor: "Simulation Agent",
      evidenceSummary: "Act Now projected 25-45m evacuation; 3h delay escalates casualty risk by 78% due to backwater rise.",
      reasoning: "Identified 'Immediate Amphibious Evacuation' as optimal course of action.",
      dependencies: ["node_risk"]
    },
    {
      id: "node_resource",
      category: "resource",
      label: "Resource Allocation (NDRF Boat 4 + ALS-02)",
      status: "active",
      confidence: 0.92,
      actor: "Resource Optimizer",
      evidenceSummary: "NDRF Boat Team 4 (0.4 km away, ETA 4 min) & Sassoon ALS Ambulance (1.8 km away, ETA 8 min).",
      reasoning: "Selected nearest specialized craft with shallow-bank boarding capabilities.",
      dependencies: ["node_simulation"]
    },
    {
      id: "node_action",
      category: "action",
      label: "Bilingual Response Alerts (EN + Marathi)",
      status: "draft",
      confidence: incident.consensus_score,
      actor: "Action Engine",
      evidenceSummary: "Tactical rescue order + citizen evacuation advisory with safe route to St. Helena Shelter.",
      reasoning: "Generated in draft requiring explicit human operator approval before broadcast.",
      dependencies: ["node_resource"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-critical text-white border-critical shadow-spatial-sm animate-pulse";
      case "verified":
        return "bg-success/15 text-success border-success/30";
      case "active":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      default:
        return "bg-alert/15 text-alert border-alert/30";
    }
  };

  return (
    <div className="spatial-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3.5">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-alert" />
          <div>
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              Universal Decision & Action Graph
            </h2>
            <span className="text-[10px] text-slate-500">
              Centerpiece: Traceable decision logic from raw crisis signal to authorized life-safety action.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          6 Connected Decision Nodes
        </span>
      </div>

      {/* Interactive Horizontal Spatial Graph Flow */}
      <div className="relative py-4 overflow-x-auto">
        <div className="min-w-[860px] flex items-center justify-between relative">
          {/* Spatial Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-slate-200 via-primary/30 to-critical/40 dark:from-slate-800 dark:via-slate-700 dark:to-critical/50 -translate-y-1/2 -z-0"></div>

          {nodes.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`relative z-10 flex flex-col items-center cursor-pointer group transition-all ${
                  isSelected ? "scale-105" : "hover:scale-102"
                }`}
                style={{ width: "130px" }}
              >
                {/* Node Pill */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-spatial-sm ${
                    isSelected
                      ? "ring-4 ring-alert/40 border-alert scale-110"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111B2E]"
                  }`}
                >
                  <span className="font-black text-xs font-mono text-primary dark:text-white">
                    0{index + 1}
                  </span>
                </div>

                {/* Node Title & Status */}
                <div className="text-center mt-2.5">
                  <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                    {node.label}
                  </h4>
                  <span
                    className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getStatusColor(
                      node.status
                    )}`}
                  >
                    {node.status}
                  </span>
                </div>

                {/* Hover Confidence Tag */}
                <span className="font-mono text-[9px] text-slate-400 mt-0.5">
                  {(node.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Drawer (Shows evidence, confidence, and reasoning) */}
      {selectedNode ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusColor(selectedNode.status)}`}>
                {selectedNode.status}
              </span>
              <h3 className="text-sm font-bold text-primary dark:text-white">
                {selectedNode.label}
              </h3>
              <span className="text-xs text-slate-400 font-mono">({selectedNode.actor})</span>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                Evidence Foundation
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                {selectedNode.evidenceSummary}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#111B2E] border border-border-light dark:border-border-dark">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                Factual Reasoning & Consensus
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                {selectedNode.reasoning}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-border-light dark:border-border-dark text-center text-xs text-slate-500">
          Click any decision node above to inspect its underlying evidence, confidence, and mathematical rationale.
        </div>
      )}
    </div>
  );
}
