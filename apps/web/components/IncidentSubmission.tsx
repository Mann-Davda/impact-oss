"use client";

import React, { useState } from "react";
import { UploadCloud, Mic, FileText, Sparkles, Check, AlertCircle, Play, Image as ImageIcon } from "lucide-react";
import { getErrorMessage, triggerPuneDemo, submitCustomIncident, Incident } from "../lib/api";
import { useLocale } from "../lib/locale";

interface IncidentSubmissionProps {
  onIncidentCreated: (incident: Incident) => void;
  onClose?: () => void;
}

export function IncidentSubmission({ onIncidentCreated, onClose }: IncidentSubmissionProps) {
  const { t } = useLocale();
  const [situationText, setSituationText] = useState(
    "Severe water accumulation along Mutha riverbanks at Bund Garden, Pune. Resident reports ground-floor home flooded with water up to window level; elderly grandmother trapped inside unable to evacuate. IMD active alert."
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSampleAssets, setUseSampleAssets] = useState(true);

  // Quick 1-click trigger for the Pune flood demo scenario
  const handleTriggerPuneDemo = async () => {
    setIsSubmitting(true);
    try {
      const incident = await triggerPuneDemo();
      onIncidentCreated(incident);
      if (onClose) onClose();
    } catch (err: unknown) {
      alert(`Error triggering Pune Demo: ${getErrorMessage(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (useSampleAssets) {
      await handleTriggerPuneDemo();
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (situationText) formData.append("situation_text", situationText);
      if (selectedImage) formData.append("image", selectedImage);
      if (selectedAudio) formData.append("audio", selectedAudio);

      const incident = await submitCustomIncident(formData);
      onIncidentCreated(incident);
      if (onClose) onClose();
    } catch (err: unknown) {
      alert(`Submission failed: ${getErrorMessage(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="spatial-card p-6 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
        <div>
          <h2 className="text-base font-extrabold uppercase tracking-wide text-primary dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-alert" />
            {t("Ingest Crisis Incident Report")}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("Submit multimodal telemetry (photograph, voice note, situational text) for multi-agent verification.")}
          </p>
        </div>

        {/* 1-Click Demo Shortcut */}
        <button
          type="button"
          onClick={handleTriggerPuneDemo}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs flex items-center gap-2 hover:opacity-95 shadow-spatial-sm border border-white/20 transition-all"
        >
          <Sparkles className="w-4 h-4 text-alert" />
          {isSubmitting ? t("Processing Pipeline...") : t("Run Pune Flood Demo (1-Click)")}
        </button>
      </div>

      {/* Preset Asset Banner */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-border-light dark:border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-alert/20 text-alert flex items-center justify-center font-bold">
            🌊
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Demo Preset: Pune Mutha River Flood Scenario
            </h4>
            <p className="text-[11px] text-slate-500">
              Pre-loaded with Bund Garden photo, Marathi audio note (*&quot;माझी आजी अडकली आहे...&quot;*), and IMD alert.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={useSampleAssets}
            onChange={(e) => setUseSampleAssets(e.target.checked)}
            className="rounded text-primary focus:ring-primary w-4 h-4"
          />
          Use Verified Demo Assets
        </label>
      </div>

      <form onSubmit={handleCustomSubmit} className="space-y-4">
        {/* Multimodal Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flood Photo Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition-colors">
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {selectedImage ? selectedImage.name : "Flood Disaster Photograph"}
              </span>
              <span className="text-[10px] text-slate-400">
                {useSampleAssets ? "Preset: mutha_river_flood.jpg (Bund Garden)" : "PNG, JPG up to 10MB"}
              </span>
            </div>
            {!useSampleAssets && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200"
              />
            )}
          </div>

          {/* Audio Distress Note */}
          <div className="p-4 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 transition-colors">
            <Mic className="w-8 h-8 text-slate-400" />
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {selectedAudio ? selectedAudio.name : t("Voice Distress Recording (Any Language)")}
              </span>
              <span className="text-[10px] text-slate-400">
                {useSampleAssets ? "Preset: marathi_voice_note.mp3 ('माझी आजी अडकली आहे...')" : "MP3, WAV, M4A"}
              </span>
            </div>
            {!useSampleAssets && (
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedAudio(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200"
              />
            )}
          </div>
        </div>

        {/* Situational Text */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            {t("Situational Context & Eyewitness Text")}
          </label>
          <textarea
            rows={3}
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            className="w-full p-3 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#111B2E] text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={t("Describe observed conditions, trapped individuals, and approximate location...")}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              {t("Cancel")}
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-spatial-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-alert" />
            {isSubmitting ? t("Running Agents...") : t("Submit to Autonomous Pipeline")}
          </button>
        </div>
      </form>
    </div>
  );
}
