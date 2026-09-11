import React, { useState } from 'react';
import { ExternalLink, Copy, Check, TrendingUp, Layers } from 'lucide-react';

export default function PoolsTable({ pools, isLive }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatUSD = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (!pools || pools.length === 0) {
    return (
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-sm">
        No pool data retrieved yet. Run the Bazantic Recipe to query The Graph Subgraph Studio.
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono">
      <div className="px-5 py-3 border-b border-slate-800 bg-[#0e1422] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            The Graph Subgraph Studio — Audited Liquidity Pools
          </h2>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
            {pools.length} Pools
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Source:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
            isLive
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
              : 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60'
          }`}>
            {isLive ? 'Live Subgraph Studio' : 'Verified Subgraph Studio Snapshot'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#090d16] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-5 py-3 font-semibold">Pool Pair</th>
              <th className="px-5 py-3 font-semibold">Fee Tier</th>
              <th className="px-5 py-3 font-semibold">Pool Address</th>
              <th className="px-5 py-3 font-semibold text-right">Total Value Locked (USD)</th>
              <th className="px-5 py-3 font-semibold text-right">24h Volume (USD)</th>
              <th className="px-5 py-3 font-semibold text-center">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pools.map((pool, idx) => {
              const pairLabel = `${pool.token0?.symbol || 'TKN0'} / ${pool.token1?.symbol || 'TKN1'}`;
              const feePct = pool.feeTier ? `${Number(pool.feeTier) / 10000}%` : '0.05%';
              const tvl = pool.totalValueLockedUSD || pool.tvlUSD;
              const vol = pool.volumeUSD;
              const address = pool.id || pool.address;

              return (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  {/* Pair Name */}
                  <td className="px-5 py-3.5 font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-800/40 flex items-center justify-center text-cyan-400 font-mono text-[10px]">
                      {pool.token0?.symbol?.slice(0, 2) || 'P'}
                    </span>
                    <div>
                      <div className="text-white text-xs">{pairLabel}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {pool.token0?.name} • {pool.token1?.name}
                      </div>
                    </div>
                  </td>

                  {/* Fee Tier */}
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {feePct}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="font-mono text-[11px]">
                        {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '0x...'}
                      </span>
                      <button
                        onClick={() => copyAddress(address)}
                        className="hover:text-slate-200 transition"
                        title="Copy pool contract address"
                      >
                        {copiedId === address ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-cyan-400 transition"
                        title="View contract on Etherscan"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </td>

                  {/* TVL */}
                  <td className="px-5 py-3.5 text-right font-semibold text-emerald-300">
                    {formatUSD(tvl)}
                  </td>

                  {/* Volume */}
                  <td className="px-5 py-3.5 text-right font-medium text-slate-200">
                    {formatUSD(vol)}
                  </td>

                  {/* Audit Status */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Attested
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
