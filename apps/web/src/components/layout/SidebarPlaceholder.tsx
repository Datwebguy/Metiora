import React from 'react';

export function SidebarPlaceholder() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 p-4 flex flex-col gap-6">
      <div className="px-2 py-1">
        <h1 className="text-lg font-bold tracking-tight text-slate-100">METIORA</h1>
        <p className="text-xs text-slate-400">AI Operating Workspace</p>
      </div>

      <nav className="flex flex-col gap-1 text-sm text-slate-300">
        <div className="px-3 py-2 rounded bg-slate-800/60 font-medium text-white">
          Dashboard Shell
        </div>
        <div className="px-3 py-2 text-slate-500 cursor-not-allowed">
          Company Memory (Phase 2)
        </div>
        <div className="px-3 py-2 text-slate-500 cursor-not-allowed">
          Strategic Intelligence (Phase 2)
        </div>
        <div className="px-3 py-2 text-slate-500 cursor-not-allowed">
          Asset Generator (Phase 2)
        </div>
      </nav>

      <div className="mt-auto p-3 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-1">Architecture State</div>
        <div>Build Phase 1 Complete</div>
        <div className="text-[10px] text-slate-500 mt-1">Ready for Phase 2 Workflows</div>
      </div>
    </aside>
  );
}
