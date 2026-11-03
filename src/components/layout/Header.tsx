import React from "react";
import { Globe, ShieldCheck } from "lucide-react";

interface HeaderProps {
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  subtitle
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 select-none p-2">
            <svg viewBox="0 0 28 28" fill="none" className="w-full h-full text-white" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" opacity="0.6"/>
              <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="10" x2="9" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="11" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="9" x2="18" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                OmniCode Studio
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-normal mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === "ar" ? "يعمل محلياً بدون خوادم خارجية" : "Offline-First • Zero Telemetry"}</span>
          </div>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            aria-label="Change language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
