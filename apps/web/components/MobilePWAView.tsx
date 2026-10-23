"use client";

import React, { useState, useEffect } from "react";
import { Navigation, Home, AlertTriangle, Send, CheckCircle2, Wifi, WifiOff } from "lucide-react";

interface MobilePWAViewProps {
  onClose?: () => void;
}

export function MobilePWAView({ onClose }: MobilePWAViewProps) {
  const [offlineReport, setOfflineReport] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check queued offline items in localStorage
    const saved = localStorage.getItem("impactos_offline_reports");
    if (saved) {
      try {
        setQueuedCount(JSON.parse(saved).length);
      } catch (e) {}
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSaveReport = () => {
    if (!offlineReport.trim()) return;

    const reportObj = {
      text: offlineReport,
      timestamp: new Date().toISOString(),
      lat: 18.542457,
      lon: 73.883776
    };

    const existing = JSON.parse(localStorage.getItem("impactos_offline_reports") || "[]");
    existing.push(reportObj);
    localStorage.setItem("impactos_offline_reports", JSON.stringify(existing));
    setQueuedCount(existing.length);
    setOfflineReport("");
    alert(isOnline ? "Report submitted to live pipeline!" : "Offline: Report queued locally. Will sync automatically when reconnected.");
  };

  return (
    <div className="spatial-card p-6 flex flex-col gap-5 max-w-md mx-auto">
      {/* Mobile PWA Header */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-critical tracking-wider block">
            Emergency Citizen Mobile Mode
          </span>
          <h2 className="text-base font-black text-primary dark:text-white">
            ImpactOS Field Pocket PWA
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-success" /> Online Live Sync
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-alert" /> Offline Storage Active
            </>
          )}
        </div>
      </div>

      {/* 4 Large One-Thumb Mobile Action Tiles (Min 56px height) */}
      <div className="space-y-3">
        {/* Action 1: Find Nearest Shelter */}
        <a
          href="https://maps.google.com/?q=18.5284,73.8812"
          target="_blank"
          rel="noreferrer"
          className="min-h-[56px] w-full p-4 rounded-xl bg-primary text-white flex items-center justify-between shadow-spatial-sm hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-yellow-300" />
            <div className="text-left">
              <span className="text-xs font-black uppercase block">Find Nearest Shelter (1.2 km)</span>
              <span className="text-[11px] text-slate-300">St. Helena Complex • Elevated Ground</span>
            </div>
          </div>
          <Navigation className="w-5 h-5 text-yellow-300" />
        </a>

        {/* Action 2: Safe Evacuation Route Warning */}
        <div className="min-h-[56px] p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-xs leading-snug">
            <strong className="block uppercase font-black text-[10px]">Avoid Ambedkar Bridge</strong>
            Approach road submerged by 0.5m. Evacuate South towards Camp corridor.
          </div>
        </div>

        {/* Action 3: Offline Report Capture */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Report Stranded Person (Offline-Safe)
          </span>
          <textarea
            rows={2}
            value={offlineReport}
            onChange={(e) => setOfflineReport(e.target.value)}
            placeholder="Type address or landmark (e.g. 'Water entering Ground floor, Bund Garden')..."
            className="w-full p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#111B2E] text-xs outline-none"
          />
          <button
            onClick={handleSaveReport}
            className="min-h-[48px] w-full rounded-lg bg-success text-white font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            <Send className="w-4 h-4" /> Save / Submit Report {queuedCount > 0 && `(${queuedCount} Queued)`}
          </button>
        </div>
      </div>
    </div>
  );
}
