import React from 'react';

export function WorkspacePlaceholder() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-2">Metiora Dashboard Shell</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Phase 1 Foundation Architecture is active. This workspace shell validates Next.js client layout, Clean Architecture module integration, and API connection readiness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1">Clean Core</div>
              <div className="text-slate-400">Domain, Application & Ports decoupled</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1">AI Provider Layer</div>
              <div className="text-slate-400">OpenAI, Anthropic, Gemini, OpenRouter</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-semibold text-slate-300 mb-1">OKX Marketplace</div>
              <div className="text-slate-400">A2A ASP Specification Ready</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
