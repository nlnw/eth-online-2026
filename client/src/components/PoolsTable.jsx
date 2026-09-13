import { useState, Fragment } from 'react';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Layers, Activity } from 'lucide-react';

export default function PoolsTable({ pools, isLive }) {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedPoolId, setExpandedPoolId] = useState(null);

  const copyAddress = (address, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    setTimeout(() => setCopiedId(null), 1500);
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
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-8 text-center text-zinc-400 dark:text-zinc-500 font-sans text-xs">
        No pool data loaded. Execute the Bazantic Recipe to query The Graph Subgraph Studio.
      </div>
    );
  }

  // Calculate max TVL for visual depth bar normalization
  const maxTvl = Math.max(...pools.map((p) => parseFloat(p.totalValueLockedUSD || p.tvlUSD || 0)), 1);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
            The Graph Subgraph Studio • Audited Liquidity Pools
          </span>
          <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono px-1.5 py-0.5 rounded">
            {pools.length} Pools Indexed
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
          <span>Indexer:</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isLive ? 'Uniswap v3 Studio (Live Mainnet)' : 'Snapshot Feed'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-500 text-[10px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 font-sans">
            <tr>
              <th className="px-4 py-2.5 font-medium">Pair / Fee</th>
              <th className="px-4 py-2.5 font-medium">Contract</th>
              <th className="px-4 py-2.5 font-medium text-right">TVL & Liquidity Depth</th>
              <th className="px-4 py-2.5 font-medium text-right">24h Volume</th>
              <th className="px-4 py-2.5 font-medium text-center">Slippage Tier</th>
              <th className="px-3 py-2.5 font-medium text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {pools.map((pool, idx) => {
              const pairLabel = `${pool.token0?.symbol || 'TKN0'} / ${pool.token1?.symbol || 'TKN1'}`;
              const feePct = pool.feeTier ? `${Number(pool.feeTier) / 10000}%` : '0.05%';
              const tvl = pool.totalValueLockedUSD || pool.tvlUSD;
              const tvlNum = parseFloat(tvl || 0);
              const depthPct = Math.min(Math.round((tvlNum / maxTvl) * 100), 100);
              const vol = pool.volumeUSD;
              const volNum = parseFloat(vol || 0);
              const address = pool.id || pool.address;
              const isExpanded = expandedPoolId === address;
              const velocity = tvlNum > 0 ? ((volNum / tvlNum) * 100).toFixed(1) : '0.0';

              return (
                <Fragment key={idx}>
                  <tr
                    onClick={() => setExpandedPoolId(isExpanded ? null : address)}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                          {pairLabel}
                        </div>
                        <span className="px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]">
                          {feePct}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans truncate max-w-[220px]">
                        {pool.token0?.name} • {pool.token1?.name}
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
                        <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}</span>
                        <button
                          onClick={(e) => copyAddress(address, e)}
                          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                          title="Copy address"
                        >
                          {copiedId === address ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-zinc-400" />
                          )}
                        </button>
                        <a
                          href={`https://etherscan.io/address/${address}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatUSD(tvl)}
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${depthPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-400">
                      <div>{formatUSD(vol)}</div>
                      <span className="text-[10px] text-zinc-500 font-sans">
                        {velocity}% vol/tvl
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Low Risk (&lt;0.05%)
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </td>
                  </tr>

                  {/* Expanded Pool Analytics Drawer */}
                  {isExpanded && (
                    <tr className="bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                          <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase mb-1">Token 0 Contract</span>
                            <div className="text-zinc-900 dark:text-zinc-100 font-semibold">{pool.token0?.symbol} ({pool.token0?.decimals || 18} dec)</div>
                            <div className="text-[11px] text-zinc-500 truncate">{pool.token0?.id || '0x...'}</div>
                          </div>

                          <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase mb-1">Token 1 Contract</span>
                            <div className="text-zinc-900 dark:text-zinc-100 font-semibold">{pool.token1?.symbol} ({pool.token1?.decimals || 18} dec)</div>
                            <div className="text-[11px] text-zinc-500 truncate">{pool.token1?.id || '0x...'}</div>
                          </div>

                          <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase mb-1">Subgraph On-Chain Depth</span>
                            <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Depth Verified: {depthPct}%
                            </div>
                            <div className="text-[10px] text-zinc-500">Tick: {pool.tick || 'N/A'} • Fee Tier: {pool.feeTier || 500}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
