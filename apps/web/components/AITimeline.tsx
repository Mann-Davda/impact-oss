"use client";

import React, { useState } from "react";
import { Clock, Cpu, FileText, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { Incident, IncidentTimeline, TimelineEvent } from "../lib/api";
import { useLocale } from "../lib/locale";

interface AITimelineProps {
  incident: Incident;
  timeline: IncidentTimeline | null;
}

export function AITimeline({ incident, timeline }: AITimelineProps) {
  const { t } = useLocale();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const events = timeline?.events || [];

  return (
    <div className="spatial-card p-5 flex flex-col gap-4">
      {/* Header with Live Activity Badge */}
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary dark:text-slate-300" />
          <h2 className="text-sm font-extrabold tracking-wide uppercase text-primary dark:text-slate-100">
            {t("AI Execution Timeline & Live Agent Activity")}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-success" />
          <span>{events.length} {t("Events Logged")}</span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {events.map((event, idx) => {
          const isAgent = event.event_type === "agent_execution";
          const isAction = event.event_type === "action_drafted";
          const durationMs = event.details.duration_ms;
          const rationale = event.details.rationale;

          return (
            <div
              key={event.id || idx}
              onClick={() => setSelectedEvent(event)}
              className="flex items-start gap-3 p-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0E1726] hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
            >
              {/* Event Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center mt-0.5 text-xs font-bold ${
                  isAgent
                    ? "bg-primary/10 text-primary dark:bg-slate-800 dark:text-slate-200"
                    : isAction
                    ? "bg-alert/15 text-alert"
                    : "bg-success/15 text-success"
                }`}
              >
                {isAgent ? (
                  <Cpu className="w-3.5 h-3.5" />
                ) : isAction ? (
                  <FileText className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary dark:group-hover:text-white transition-colors">
                    {event.title}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {t("Actor:")} {event.actor}
                  </span>
                  {event.confidence !== undefined && (
                    <span className="font-mono text-[10px] font-bold text-success">
                      {t("Conf:")} {(event.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  {typeof durationMs === "number" && (
                    <span className="font-mono text-[10px] text-slate-400">
                      {durationMs}ms
                    </span>
                  )}
                </div>

                {typeof rationale === "string" && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                    {rationale}
                  </p>
                )}
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Selected Event Details Modal or Footer preview */}
      {selectedEvent && (
        <div className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border-light dark:border-border-dark text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-primary dark:text-white">
              {t("Event Detail:")} {selectedEvent.title}
            </span>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              {t("Close")}
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono break-all max-h-32 overflow-y-auto">
            {JSON.stringify(selectedEvent.details, null, 2)}
          </p>
        </div>
      )}
    </div>
  );
}
