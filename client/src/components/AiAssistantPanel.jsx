import React from 'react';
import { Cpu, AlertTriangle, CheckCircle2, ShieldQuestion, HelpCircle, ArrowRight } from 'lucide-react';

export default function AiAssistantPanel({ loading, suggestions }) {
  if (!suggestions) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-premium text-white h-full flex flex-col justify-center items-center text-center">
        <div className="bg-slate-800/80 p-4 rounded-full text-slate-500 mb-4 animate-pulse">
          <Cpu className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="font-bold text-base text-slate-200">AI Assistant Idle</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          Type an issue title in the ticket form to activate the HindConnect smart triage copilot.
        </p>
      </div>
    );
  }

  const { predictedCategory, priority, suggestedTeam, similarTickets, troubleshootingSteps } = suggestions;

  const priorityColors = {
    Low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    High: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Critical: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-6 shadow-premium h-full flex flex-col justify-between relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-corporate-orange/10 to-purple-500/0 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        {/* Header */}
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800">
          <div className="bg-gradient-accent p-2 rounded-xl text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">HindConnect Copilot</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Real-time AI Assist</p>
          </div>
          {loading && (
            <div className="ml-auto flex space-x-1">
              <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          )}
        </div>

        {/* Predictions Grid */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Predicted Category</span>
            <span className="text-xs font-bold text-white block">{predictedCategory}</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Priority Classification</span>
            <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityColors[priority] || 'bg-slate-700/20 text-slate-300'}`}>
              {priority}
            </span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 col-span-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Suggested Assignment Desk</span>
            <span className="text-xs font-bold text-corporate-orange">{suggestedTeam}</span>
          </div>
        </div>

        {/* Duplicate warning */}
        {similarTickets && similarTickets.length > 0 && (
          <div className="mt-5 bg-red-950/20 border border-red-900/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold">Similar Active Tickets Detected</h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
              We found open tickets that might cover this issue. Consider checking these first:
            </p>
            <div className="space-y-2">
              {similarTickets.map((t) => (
                <div key={t.id} className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between">
                  <span className="text-[11px] text-white truncate max-w-[150px]">{t.title}</span>
                  <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting walkthrough */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 text-slate-300 mb-3">
            <HelpCircle className="w-4 h-4 text-corporate-orange" />
            <h4 className="text-xs font-bold text-white">Recommended Troubleshooting Steps</h4>
          </div>
          <div className="space-y-2.5">
            {troubleshootingSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-slate-950/20 border border-slate-800/40 p-2.5 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-corporate-orange shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-300 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
        HindConnect smart categorization routes issues automatically to SLA desks, decreasing resolution response latency.
      </div>
    </div>
  );
}
