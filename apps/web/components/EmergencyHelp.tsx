"use client";

import { PhoneCall, ShieldAlert } from "lucide-react";
import { useLocale } from "../lib/locale";

const contacts = [
  { number: "112", label: "Nationwide emergency response (police, fire and medical help)", primary: true },
  { number: "102", label: "National Ambulance Service (availability may vary)" },
  { number: "100", label: "Police helpline (legacy; call 112 first)" },
  { number: "101", label: "Fire helpline (legacy; call 112 first)" },
  { number: "1070", label: "Relief Commissioner for natural calamities" },
  { number: "011-24363260", label: "NDRF earthquake, flood and disaster response" },
  { number: "1073", label: "Road accident helpline" },
  { number: "1906", label: "LPG leak emergency" },
  { number: "1930", label: "Cybercrime helpline" },
  { number: "1098", label: "Child Helpline" },
  { number: "181", label: "Women Helpline (availability may vary by state)" },
  { number: "1091", label: "Anti-Obscene Calls Cell" },
  { number: "14567", label: "Senior citizens helpline" },
  { number: "14456", label: "Persons with disabilities helpline" },
];

export function EmergencyHelp() {
  const { t } = useLocale();

  return (
    <section
      aria-labelledby="emergency-help-title"
      className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-red-200 bg-white p-4 shadow-sm dark:border-red-900 dark:bg-[#111B2E] sm:mt-6 sm:p-5"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 text-critical" />
          <div>
            <h2 id="emergency-help-title" className="text-base font-extrabold text-slate-900 dark:text-white">
              {t("India emergency helplines")}
            </h2>
            <p className="text-xs font-bold text-critical">{t("For any immediate threat to life, call 112 first.")}</p>
          </div>
        </div>
        <p className="max-w-2xl text-xs text-slate-600 dark:text-slate-300">
          {t("Emergency numbers and state availability can change; check the official directory.")}
          <span className="mt-1 block font-bold text-critical">{t("Call 112 immediately if another number is unavailable.")}</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <a
            key={contact.number}
            href={`tel:${contact.number}`}
            className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-critical ${
              contact.primary
                ? "border-critical bg-critical text-white hover:bg-red-700"
                : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="min-w-0">
              <span className="block text-lg font-black leading-tight">{contact.number}</span>
              <span className={`mt-0.5 block text-xs leading-snug ${contact.primary ? "text-white/90" : "text-slate-600 dark:text-slate-300"}`}>
                {t(contact.label)}
              </span>
            </span>
            <span className={`flex shrink-0 items-center gap-1 text-xs font-bold ${contact.primary ? "text-white" : "text-primary dark:text-white"}`}>
              <PhoneCall className="h-4 w-4" />
              {t("Call")}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{t("Availability and routing can change; use official state/district contacts where published.")}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-bold">{t("Official information")}:</span>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://112.gov.in/" target="_blank" rel="noreferrer">112.gov.in</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://www.india.gov.in/directory/helpline" target="_blank" rel="noreferrer">{t("National Portal")}</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://ndma.gov.in/" target="_blank" rel="noreferrer">NDMA</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://www.mha.gov.in/" target="_blank" rel="noreferrer">MHA</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://nhm.gov.in/" target="_blank" rel="noreferrer">NHM</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://wcd.gov.in/" target="_blank" rel="noreferrer">WCD</a>
          <a className="underline hover:text-primary dark:hover:text-white" href="https://iocl.com/" target="_blank" rel="noreferrer">IndianOil</a>
        </span>
      </div>
    </section>
  );
}
