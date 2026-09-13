import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function PoolsTable({ pools, isLive }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyAddress = (address) => {
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

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
            Audited Liquidity Pools
          </span>
          <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono px-1.5 py-0.2 rounded">
            {pools.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
          <span>Source:</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">
            {isLive ? 'The Graph Subgraph Studio (Live)' : 'The Graph Subgraph Studio (Snapshot)'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-500 text-[10px] uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 font-sans">
            <tr>
              <th className="px-4 py-2.5 font-medium">Pair</th>
              <th className="px-4 py-2.5 font-medium">Fee</th>
              <th className="px-4 py-2.5 font-medium">Address</th>
              <th className="px-4 py-2.5 font-medium text-right">TVL (USD)</th>
              <th className="px-4 py-2.5 font-medium text-right">24h Volume</th>
              <th className="px-4 py-2.5 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {pools.map((pool, idx) => {
              const pairLabel = `${pool.token0?.symbol || 'TKN0'} / ${pool.token1?.symbol || 'TKN1'}`;
              const feePct = pool.feeTier ? `${Number(pool.feeTier) / 10000}%` : '0.05%';
              const tvl = pool.totalValueLockedUSD || pool.tvlUSD;
              const vol = pool.volumeUSD;
              const address = pool.id || pool.address;

              return (
                <tr key={idx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                      {pairLabel}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans">
                      {pool.token0?.name} • {pool.token1?.name}
                    </div>
                  </td>

                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
                      {feePct}
                    </span>
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
                      <span>
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                      </span>
                      <button
                        onClick={() => copyAddress(address)}
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
                        className="hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    </div>
                  </td>

                  <td className="px-4 py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">
                    {formatUSD(tvl)}
                  </td>

                  <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-400">
                    {formatUSD(vol)}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
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
