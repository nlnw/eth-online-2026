import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Download } from 'lucide-react';

export default function TerminalLog({ logs, onClearLogs, isExecuting, onExportLogs }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getTagBadge = (tag) => {
    switch (tag) {
      case 'GATEWAY':
        return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
      case 'x402_AUTH':
        return 'text-zinc-800 dark:text-zinc-300 bg-zinc-200/70 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700';
      case 'THE_GRAPH':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900';
      case 'DETERMINISTIC_AUDIT':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900';
      case 'ENSv2':
        return 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900';
      case 'ERROR':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900';
      default:
        return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md overflow-hidden font-mono text-xs shadow-sm">
      {/* Console Header Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-950/80 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
            Execution Lifecycle Log
          </span>
          <span className="text-zinc-400 text-[11px]">({logs.length} events)</span>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400 animate-pulse" />
              Running...
            </span>
          )}
          {logs.length > 0 && onExportLogs && (
            <button
              onClick={onExportLogs}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
              title="Download run log record (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClearLogs}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Output Area */}
      <div className="p-3.5 h-64 overflow-y-auto space-y-1.5 bg-zinc-50/50 dark:bg-zinc-950 text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-zinc-400 dark:text-zinc-600 py-10 text-center font-sans">
            Ready to execute. Click "Run Bazantic Recipe" or "Auto-Run Full Flow".
          </div>
        ) : (
          logs.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 text-[10px] shrink-0 select-none pt-0.5">
                {item.timestamp}
              </span>
              {item.tag && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold border shrink-0 ${getTagBadge(
                    item.tag
                  )}`}
                >
                  {item.tag}
                </span>
              )}
              <span
                className={`break-all ${
                  item.type === 'error'
                    ? 'text-red-600 dark:text-red-400 font-medium'
                    : item.type === 'success'
                    ? 'text-zinc-800 dark:text-zinc-200'
                    : item.type === 'warn'
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {item.text}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Console Footer */}
      <div className="bg-zinc-50 dark:bg-zinc-950/80 px-4 py-1.5 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Stages: 1. Gateway Request</span>
          <span>&gt;</span>
          <span>2. x402 Check</span>
          <span>&gt;</span>
          <span>3. Subgraph Studio</span>
          <span>&gt;</span>
          <span>4. ENSv2 Attestation</span>
        </div>
        <span>Sepolia Testnet</span>
      </div>
    </div>
  );
}
