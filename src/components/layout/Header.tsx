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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-black text-xl select-none">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                OmniCode Studio
              </h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                v1.0.0
              </span>
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
