"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Home, Shield, AlertTriangle, Layers, ExternalLink } from "lucide-react";
import { Incident } from "../lib/api";

interface IncidentMapProps {
  incident: Incident;
}

export function IncidentMap({ incident }: IncidentMapProps) {
  const [activeLayer, setActiveLayer] = useState<"all" | "shelters" | "boats">("all");
  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);

  // Demo POIs around Pune Bund Garden corridor (labelled source: mock)
  const pois = [
    {
      id: "inc_pin",
      name: "Incident Epicenter: Mutha River Bank",
      type: "incident",
      lat: 18.542457,
      lon: 73.883776,
      distance: "0.0 km",
      status: "Inundation Threat (+1.32m over danger mark)",
      source: "Multimodal Geo-Tag"
    },
    {
      id: "shelter_1",
      name: "St. Helena High School Complex Relief Shelter",
      type: "shelter",
      lat: 18.5284,
      lon: 73.8812,
      distance: "1.2 km",
      capacity: 250,
      status: "Operational • Elevated Dry Ground",
      source: "DEMO DATA (mock)"
    },
    {
      id: "boat_1",
      name: "NDRF Motorized Boat Team 4 Staging Point",
      type: "rescue_boat",
      lat: 18.5412,
      lon: 73.8821,
      distance: "0.4 km",
      capacity: 6,
      status: "Standby for Elderly Extraction",
      source: "DEMO DATA (mock)"
    },
    {
      id: "hospital_1",
      name: "Sassoon Hospital ALS Ambulance 02",
      type: "hospital",
      lat: 18.5315,
      lon: 73.8742,
      distance: "1.8 km",
      capacity: 2,
      status: "Geriatric Paramedic Onboard",
      source: "DEMO DATA (mock)"
    }
  ];

  return (
    <div className="spatial-card p-5 flex flex-col gap-4">
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-critical" />
          <div>
            <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
              Crisis Spatial Grid: Pune Bund Garden Sector
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Coordinates: {incident.latitude}, {incident.longitude}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
            DEMO SPATIAL LAYERS
          </span>
          <a
            href={`https://www.google.com/maps/@${incident.latitude},${incident.longitude},15z`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Spatial Canvas / Map Visualization */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
        {/* River corridor representation */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Swollen Mutha River Channel Graphic */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M -20 220 C 150 200, 250 140, 450 160 C 650 180, 800 120, 1000 130"
            stroke="#1E3A8A"
            strokeWidth="60"
            fill="none"
            strokeLinecap="round"
            className="opacity-70 animate-pulse"
          />
          <path
            d="M -20 220 C 150 200, 250 140, 450 160 C 650 180, 800 120, 1000 130"
            stroke="#3B82F6"
            strokeWidth="14"
            fill="none"
            strokeDasharray="8 6"
            className="opacity-60"
          />
        </svg>

        {/* POI Markers */}
        {/* 1. Epicenter */}
        <div
          onClick={() => setSelectedPoi(pois[0])}
          className="absolute left-[45%] top-[48%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20"
        >
          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-critical opacity-75"></span>
          <div className="relative w-7 h-7 rounded-full bg-critical border-2 border-white flex items-center justify-center text-white shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="mt-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/80 text-white border border-critical">
            Flood Hazard
          </span>
        </div>

        {/* 2. Boat Staging */}
        <div
          onClick={() => setSelectedPoi(pois[2])}
          className="absolute left-[35%] top-[56%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 border border-white flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
            <Navigation className="w-3 h-3 text-white" />
          </div>
          <span className="text-[9px] font-bold text-blue-200 bg-black/60 px-1 rounded mt-0.5">
            Boat 4 (400m)
          </span>
        </div>

        {/* 3. Shelter */}
        <div
          onClick={() => setSelectedPoi(pois[1])}
          className="absolute left-[65%] top-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20"
        >
          <div className="w-6 h-6 rounded-full bg-success border border-white flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
            <Home className="w-3 h-3 text-white" />
          </div>
          <span className="text-[9px] font-bold text-emerald-200 bg-black/60 px-1 rounded mt-0.5">
            Shelter (1.2 km)
          </span>
        </div>

        {/* 4. Ambulance */}
        <div
          onClick={() => setSelectedPoi(pois[3])}
          className="absolute left-[22%] top-[32%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex flex-col items-center z-20"
        >
          <div className="w-6 h-6 rounded-full bg-purple-600 border border-white flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-[9px] font-bold text-purple-200 bg-black/60 px-1 rounded mt-0.5">
            ALS Unit (1.8 km)
          </span>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md rounded-lg p-2.5 text-[10px] text-white border border-white/10 z-30">
          <div className="font-extrabold uppercase text-[9px] text-slate-400 mb-1">Live Asset Legend</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-critical"></span> Flood Hazard
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> NDRF Boats
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span> Evac Shelters
            </span>
          </div>
        </div>
      </div>

      {/* Selected POI Details Card */}
      {selectedPoi && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark flex items-center justify-between text-xs">
          <div>
            <h4 className="font-bold text-primary dark:text-white">{selectedPoi.name}</h4>
            <p className="text-[11px] text-slate-500">
              {selectedPoi.status} • Distance: {selectedPoi.distance} • ({selectedPoi.source})
            </p>
          </div>
          <button
            onClick={() => setSelectedPoi(null)}
            className="text-[10px] text-slate-400 hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
