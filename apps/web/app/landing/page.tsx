"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, Cpu, Sparkles, CheckCircle2, TrendingUp, Layers, MapPin, Volume2 } from "lucide-react";

export default function LandingStoryPage() {
  const narrativeSteps = [
    {
      stage: "01. CHAOS",
      headline: "The Unstructured Inundation of Information",
      description: "A disaster unfolds in real time. Emergency call centers are bombarded with fragmented phone calls, blurry smartphone photos, contradictory social media rumors, and multilingual distress voice notes. In Pune, as the Mutha River surges past its banks, a frantic audio recording arrives in Marathi: 'माझी आजी अडकली आहे...' (My grandmother is trapped and cannot leave). Human operators are overwhelmed by contradictory inputs.",
      tag: "Sensory Overload",
      accent: "text-alert border-alert/30 bg-alert/10",
      graphic: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono space-y-2">
          <div className="flex items-center gap-2 text-alert">
            <Volume2 className="w-4 h-4" /> [AUDIO] marathi_voice_note.mp3 (Distress Speech)
          </div>
          <div className="p-2 rounded bg-black/50 text-[11px] text-slate-400">
            "माझी आजी अडकली आहे आणि ती बाहेर पडू शकत नाही..."
          </div>
          <div className="text-slate-400 text-[10px]">
            + Visual watermarks: Bund Garden wall submerged<br/>
            + IMD Warning 43063: Heavy rainfall watch active
          </div>
        </div>
      )
    },
    {
      stage: "02. UNDERSTANDING",
      headline: "Multimodal AI Parses Reality from Chaos",
      description: "ImpactOS ingests disparate raw modalities in one simultaneous multimodal context. The Intake and Intent agents transcribe the Marathi dialect, detect physical landmarks ('Parakh House' signage along Bund Garden), and identify the critical human stakeholder: an elderly resident trapped in a ground-floor home unable to climb to roof level.",
      tag: "Epistemic Clarity",
      accent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
      graphic: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5">
          <div className="text-emerald-400 font-bold">✓ Language Identified: Marathi (मराठी)</div>
          <div className="text-slate-300 text-[11px]">Transcript: "My grandmother is trapped and cannot get out."</div>
          <div className="text-blue-400 text-[11px]">Primary Intent: Emergency Life Safety & Extraction</div>
          <div className="text-slate-400 text-[10px]">Triage Urgency: CRITICAL • Mobility: Impaired</div>
        </div>
      )
    },
    {
      stage: "03. VERIFICATION",
      headline: "Cross-Modal Sensor & Satellite Triangulation",
      description: "AI without verification is hallucination. ImpactOS never acts on raw claims alone. The Truth & Verification Agent cross-checks the visual submergence lines against the Pune Bund Garden hydrological gauge (7.82m, +1.32m above danger mark) and upstream Khadakwasla Dam release rates (35,400 cusecs). 4 immutable evidence items are committed to the audit trail.",
      tag: "Immutable Trust",
      accent: "text-success border-success/30 bg-success/10",
      graphic: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex justify-between items-center text-success font-bold text-[11px]">
            <span>Claim: Mutha River Danger Threshold Exceeded</span>
            <span>VERIFIED (0.95)</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Source: Bund Garden Gauge (7.82m vs 6.50m threshold)<br/>
            Source: Khadakwasla Reservoir Telemetry (35,400 cusecs)
          </div>
          <div className="text-[10px] text-emerald-400">
            Consensus Convergence: 86.4% Weighted Confidence
          </div>
        </div>
      )
    },
    {
      stage: "04. ACTION",
      headline: "Explainable Optimization & Human-in-the-Loop Orders",
      description: "What should we do? The Simulation Agent compares 'Act Now' against 'Delay 3 Hours', demonstrating a 78% escalation in casualty risk if evacuation is postponed. The Resource Optimizer solves greedy linear matching, dispatching NDRF Boat 4 and Sassoon ALS Ambulance 02. Draft bilingual alerts are rendered in English and Marathi, awaiting authorized commander sign-off.",
      tag: "Responsible Authority",
      accent: "text-critical border-critical/30 bg-critical/10",
      graphic: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5">
          <div className="text-yellow-400 font-bold text-[11px]">
            [DRAFT ACTION] NDRF Boat 4 + Paramedic Ambulance
          </div>
          <div className="text-slate-300 text-[10px]">
            Target: Bund Garden Bank • ETA: 4 minutes
          </div>
          <div className="text-slate-400 text-[10px]">
            मराठी: "बंड गार्डन नदीकाठ परिसरात तातडीने एनडीआरएफ रबर बोट पाठवा..."
          </div>
          <div className="text-critical font-bold text-[10px]">
            Status: PENDING HUMAN OPERATOR SIGN-OFF (Rule 4)
          </div>
        </div>
      )
    },
    {
      stage: "05. IMPACT",
      headline: "Measurable Efficacy & Institutional Learning",
      description: "The boat arrives. The trapped grandmother is safely extracted and transferred to the standby ALS unit. 145 citizens are guided away from the submerged Babasaheb Ambedkar Bridge approach to elevated shelter at St. Helena Complex. Mean response time drops from 54 minutes to 11.4 minutes. The crisis vector is fingerprinted into the Crisis DNA library to safeguard future monsoons.",
      tag: "Life Safety Realized",
      accent: "text-purple-500 border-purple-500/30 bg-purple-500/10",
      graphic: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-black/40">
              <span className="text-slate-400 text-[10px]">People Protected</span>
              <div className="text-base font-black text-white">145 [120–175]</div>
            </div>
            <div className="p-2 rounded bg-black/40">
              <span className="text-slate-400 text-[10px]">Response Latency</span>
              <div className="text-base font-black text-blue-400">11.4 mins</div>
            </div>
          </div>
          <div className="text-[10px] text-purple-300">
            Crisis DNA Benchmark Matched: August 2019 Flood (99% Cosine Similarity)
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col selection:bg-alert/30">
      {/* Top Floating Spatial Bar */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-[#0B1220]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-base border border-white/20">
            Ω
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">ImpactOS</span>
            <span className="text-xs text-slate-400 ml-2 font-mono">From Chaos To Action</span>
          </div>
        </div>

        <Link
          href="/"
          className="px-5 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-slate-100 shadow-spatial-sm transition-all"
        >
          <span>Launch Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-alert mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Autonomous Emergency Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          When seconds decide lives, AI must explain every step.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 mt-6 max-w-2xl leading-relaxed">
          ImpactOS turns messy, contradictory multimodal crisis signals into verified ground truth,
          mathematical consensus, and human-authorized tactical action.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm border border-white/20 shadow-spatial-md hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            Open Live Pune Flood Demo
            <ArrowRight className="w-4 h-4 text-alert" />
          </Link>
        </div>
      </header>

      {/* Scroll-Driven Storytelling Narrative */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {narrativeSteps.map((step, idx) => (
          <div
            key={idx}
            className="spatial-card p-8 bg-[#111B2E] border border-white/10 flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="flex-1 space-y-3">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${step.accent}`}>
                {step.stage} • {step.tag}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {step.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="w-full md:w-[320px] shrink-0">
              {step.graphic}
            </div>
          </div>
        ))}
      </section>

      {/* Call to Action Footer */}
      <footer className="border-t border-white/10 py-16 text-center flex flex-col items-center px-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Experience ImpactOS in Action
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Explore the functional Bento Grid, live spatial map, and explainability replay for the Pune flood demo.
        </p>
        <Link
          href="/"
          className="mt-6 px-8 py-3.5 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center gap-2 hover:bg-slate-100 transition-all shadow-spatial-lg"
        >
          <span>Launch Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <span className="text-xs text-slate-500 mt-8 font-mono">
          ImpactOS • Version 1.0 • Designed for Mission-Critical Operations
        </span>
      </footer>
    </div>
  );
}
