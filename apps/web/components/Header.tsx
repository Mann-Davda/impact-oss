"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Type, Search, AlertTriangle, RefreshCw } from "lucide-react";
import { useLocale, type Locale } from "../lib/locale";

interface HeaderProps {
  isEmergency: boolean;
  manualOverride: boolean;
  onToggleOverride: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function Header({
  isEmergency,
  manualOverride,
  onToggleOverride,
  onRefresh,
  isLoading,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [isLargeText, setIsLargeText] = useState(false);
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (isLargeText) {
      document.documentElement.classList.add("large-text");
    } else {
      document.documentElement.classList.remove("large-text");
    }
  }, [isLargeText]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light dark:border-border-dark bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md px-3 py-2.5 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 shadow-spatial-sm">
      {/* Brand & System Status */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg tracking-wider shadow-spatial-sm border border-white/20">
            Ω
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-primary dark:text-white">
                ImpactOS
              </span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                {t("DEMO · NOT LIVE")}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
              {t("From Chaos To Action • Crisis Command Center")}
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t("5 Agents Synchronized")}
          </span>
        </div>
      </div>

      {/* Liquid Glass Search Bar (Accent styling rule from Part 0) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
        <div className="liquid-glass w-full rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("Search verified evidence, Pune river gauges, emergency shelters...")}
            className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-xs"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 rounded border border-slate-300 dark:border-slate-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Control Actions & Accessibility Toggles */}
      <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto sm:gap-2.5">
        <label className="sr-only" htmlFor="language-select">{t("Choose language")}</label>
        <select
          id="language-select"
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          aria-label={t("Choose language")}
          className="min-h-10 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#111B2E] px-2 text-xs font-bold text-slate-700 dark:text-slate-200"
        >
          <option value="en">{t("English")}</option>
          <option value="mr">{t("Marathi")}</option>
          <option value="hi">{t("Hindi")}</option>
        </select>

        {/* Emergency Mode Override Indicator */}
        {isEmergency && (
          <button
            onClick={onToggleOverride}
            title={t(manualOverride ? "Switch to Emergency View" : "Override Emergency Mode")}
            className={`mr-auto min-h-10 max-w-[calc(100%-8.5rem)] sm:mr-0 sm:max-w-none px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 border transition-all whitespace-nowrap ${
              manualOverride
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                : "bg-critical text-white border-critical hover:bg-red-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {t(manualOverride ? "Emergency View Overridden" : "EMERGENCY ACTIVE")}
          </button>
        )}

        {/* Reload / Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          aria-label={t("Refresh Data")}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Large Text Accessibility Toggle */}
        <button
          onClick={() => setIsLargeText(!isLargeText)}
          title={t("Toggle Large Text Mode (Accessibility)")}
          aria-label={t("Toggle Large Text")}
          className={`p-2 rounded-lg border transition-colors ${
            isLargeText
              ? "bg-primary text-white border-primary"
              : "border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          title={t("Toggle Theme")}
          aria-label={t("Toggle Theme")}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}
