"use client";

import React from "react";
import { AlertOctagon, Navigation, PhoneCall, ShieldCheck, ArrowRight, EyeOff } from "lucide-react";
import { Incident } from "../lib/api";
import { useLocale } from "../lib/locale";

interface EmergencyBannerProps {
  incident: Incident;
  manualOverride: boolean;
  onToggleOverride: () => void;
}

export function EmergencyBanner({ incident, manualOverride, onToggleOverride }: EmergencyBannerProps) {
  const { t } = useLocale();
  if (!incident.is_emergency) return null;

  // Emergency Mode View (Brutalist, high-contrast, large tap targets >= 56px)
  if (!manualOverride) {
    return (
      <div 
        role="alert" 
        aria-live="assertive"
        className="w-full bg-[#E63946] text-white border-b-4 border-black p-4 sm:p-8"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-white/30 pb-4">
            <div className="flex min-w-0 items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-white text-[#E63946] flex items-center justify-center font-black text-2xl sm:text-3xl rounded border-2 border-black">
                ⚠
              </div>
              <div className="min-w-0">
                <span className="inline-flex mb-1 px-2 py-1 rounded bg-amber-100 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wide">
                  {t("Demo scenario · Not a live alert")}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                  {t("CRITICAL FLOOD EMERGENCY")}
                </h1>
                <p className="text-sm sm:text-lg font-bold uppercase tracking-wider text-white/90">
                  {incident.location_name} • {t("MUTHA RIVER DANGER THRESHOLD EXCEEDED")}
                </p>
              </div>
            </div>

            {/* Manual Override Button */}
            <button
              onClick={onToggleOverride}
              className="min-h-[56px] w-full md:w-auto px-4 sm:px-6 bg-black text-white hover:bg-neutral-900 border-2 border-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <EyeOff className="w-5 h-5" />
              {t("Switch to Command View (Override)")}
            </button>
          </div>

          {/* Cause and Immediate Orders */}
          <div className="bg-black/20 p-3 sm:p-5 rounded border border-white/40">
            <p className="text-sm uppercase font-extrabold tracking-wider text-yellow-200 mb-1">
              {t("Automatic emergency trigger reason")} ({t("Computed risk score")}: {incident.risk_score.toFixed(2)})
            </p>
            <p className="text-base sm:text-lg font-bold leading-snug">
              {t(incident.emergency_rationale || "Critical river surge (+1.32m over danger mark) with trapped elderly citizen requiring immediate amphibious evacuation.")}
            </p>
          </div>

          {/* High-Contrast Immediate Action Cards (Min 56px tap targets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white text-black p-4 sm:p-5 rounded border-2 border-black flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                    {t("NEAREST RELIEF SHELTER")}
                </span>
                <h3 className="text-xl font-black mt-1">St. Helena High School Complex</h3>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  {t("Distance: 1.2 km (Elevated ground • Capacity: 250)")}
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=18.5284,73.8812"
                target="_blank"
                rel="noreferrer"
                className="mt-4 min-h-[56px] bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 font-black uppercase text-sm rounded border border-black"
              >
                <Navigation className="w-5 h-5 text-yellow-400" />
                {t("Navigate to Shelter (1.2 km)")}
              </a>
            </div>

            <div className="bg-white text-black p-4 sm:p-5 rounded border-2 border-black flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                  {t("TACTICAL RESCUE DISPATCH")}
                </span>
                <h3 className="text-xl font-black mt-1">NDRF Motorized Boat Team 4</h3>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  {t("Staging: Bund Garden Boat Club (600m upstream)")}
                </p>
              </div>
              <button
                onClick={() => alert("NDRF Rescue Unit 4 alerted for priority elderly evacuation.")}
                className="mt-4 min-h-[56px] bg-red-700 text-white hover:bg-red-800 flex items-center justify-center gap-2 font-black uppercase text-sm rounded border border-black"
              >
                <PhoneCall className="w-5 h-5" />
                {t("Confirm Boat Dispatch")}
              </button>
            </div>

            <div className="bg-white text-black p-4 sm:p-5 rounded border-2 border-black flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-red-600 tracking-wider">
                  {t("GERIATRIC MEDICAL STANDBY")}
                </span>
                <h3 className="text-xl font-black mt-1">Sassoon Hospital ALS Unit 02</h3>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  {t("Station Road Junction (1.8 km) • Geriatric EMT on board")}
                </p>
              </div>
              <button
                onClick={() => alert("Sassoon ALS Paramedic Ambulance assigned to Bund Garden rendezvous point.")}
                className="mt-4 min-h-[56px] bg-neutral-900 text-white hover:bg-black flex items-center justify-center gap-2 font-black uppercase text-sm rounded border border-black"
              >
                <ShieldCheck className="w-5 h-5 text-green-400" />
                {t("Dispatch Ambulance (ALS-02)")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal View Top Banner when Emergency Mode is manually overridden
  return (
    <div className="w-full bg-critical/15 border-b border-critical/30 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-critical">
      <div className="flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-critical animate-pulse" />
        <span>
          <strong>{t("CRITICAL RISK DETECTED:")}</strong> {t("Emergency Mode active for")} {incident.location_name} ({t("Overridden to Command View")}).
        </span>
      </div>
      <button
        onClick={onToggleOverride}
        className="font-bold underline hover:text-red-700 flex items-center gap-1"
      >
        {t("Restore Emergency High-Contrast View")} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
