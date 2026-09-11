import React, { useState } from 'react';
import { ShieldCheck, Cpu, Globe, Check, Copy, ExternalLink, Zap } from 'lucide-react';

export default function HeaderBadge({ agentName, resolverAddress, facilitatorAddress, onOpenRecipe }) {
  const [copied, setCopied] = useState(false);

  const copyResolver = () => {
    navigator.clipboard.writeText(resolverAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Brand & Agent Subname */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                GraphAgent Gateway
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                  v1.0.0
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-slate-500">ETHOnline 2026</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Subgraph Studio & ENSv2
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Identity Badge: ENSv2 Subname */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Subname:</span>
            <span className="font-semibold text-emerald-300 font-mono">
              {agentName || 'oracle.agentcorp.eth'}
            </span>
            <span className="bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] border border-emerald-800/50">
              ENSv2 EAC
            </span>
          </div>

          {/* Network Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sepolia</span>
            <span className="text-slate-500 text-[10px]">(11155111)</span>
          </div>

          {/* Bazantic Gateway Active Badge */}
          <button
            onClick={onOpenRecipe}
            className="flex items-center gap-1.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 rounded-lg px-2.5 py-1.5 text-purple-300 transition cursor-pointer"
            title="Click to view Bazantic Recipe specification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>x402 MPP Gateway</span>
            <span className="bg-purple-900 text-purple-200 px-1 py-0.2 rounded text-[10px]">
              Active
            </span>
          </button>

          {/* Resolver Quick Copy */}
          <button
            onClick={copyResolver}
            className="flex items-center gap-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-400 hover:text-slate-200 transition"
            title={`Copy Resolver: ${resolverAddress}`}
          >
            <span className="text-[11px] text-slate-500">Resolver:</span>
            <span className="text-[11px] text-slate-300">
              {resolverAddress.substring(0, 6)}...{resolverAddress.substring(resolverAddress.length - 4)}
            </span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
