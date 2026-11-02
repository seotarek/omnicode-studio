import React from "react";
import { Globe, Sun, Moon } from "lucide-react";

interface HeaderProps {
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  subtitle
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-xl">
            Ω
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
              OmniCode Studio
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">v1.0.0</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "العربية" : "English"}
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
