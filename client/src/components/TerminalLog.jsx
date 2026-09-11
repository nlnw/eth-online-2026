import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowDownCircle } from 'lucide-react';

export default function TerminalLog({ logs, onClearLogs, isExecuting }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getTagColor = (tag) => {
    switch (tag) {
      case 'GATEWAY':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';
      case 'x402_AUTH':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      case 'THE_GRAPH':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'DETERMINISTIC_AUDIT':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'ENSv2':
        return 'text-blue-400 bg-blue-950/60 border-blue-800/60';
      case 'ERROR':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="bg-[#0e1422] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-400 ml-2 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>agent@graphagent-gateway:~$ ./run-recipe.sh</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="flex items-center gap-1.5 text-[11px] text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Executing Pipeline...
            </span>
          )}
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-slate-300 transition p-1"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 h-72 overflow-y-auto space-y-2 bg-[#080c14]/95 select-text font-mono text-[12px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">
            Terminal ready. Click "Run Bazantic Recipe" to execute the pipeline.
          </div>
        ) : (
          logs.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 animate-fadeIn">
              <span className="text-slate-500 text-[11px] shrink-0 select-none">
                {item.timestamp}
              </span>
              {item.tag && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${getTagColor(
                    item.tag
                  )}`}
                >
                  {item.tag}
                </span>
              )}
              <span
                className={`break-all ${
                  item.type === 'error'
                    ? 'text-rose-400 font-semibold'
                    : item.type === 'success'
                    ? 'text-emerald-300'
                    : item.type === 'warn'
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {item.text}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer info */}
      <div className="bg-[#0a0e1a] px-4 py-1.5 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Lifecycle: 4 Stages</span>
          <span>•</span>
          <span className="text-purple-400">1. x402 Micropayment</span>
          <span>•</span>
          <span className="text-amber-400">2. The Graph Studio</span>
          <span>•</span>
          <span className="text-blue-400">3. ENSv2 Resolver</span>
        </div>
        <span className="text-slate-400">UTF-8 / JSON-RPC</span>
      </div>
    </div>
  );
}
