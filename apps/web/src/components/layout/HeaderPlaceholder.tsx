import React from 'react';

export function HeaderPlaceholder() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/60 px-6 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-semibold text-slate-200">Metiora AI Operating Partner</span>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">OKX.AI ASP</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>System Status: <strong className="text-emerald-400">Online</strong></span>
        <span>Version: <strong className="text-slate-200">v1.0.0-phase1</strong></span>
      </div>
    </header>
  );
}
