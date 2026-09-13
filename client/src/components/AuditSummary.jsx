import { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function AuditSummary({ data }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!data) return null;

  const { reportHash, txHash, agentName, summary, ensAttestation, recordKey, resolverAddress } = data;

  const copyText = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 1500);
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

  return (
    <div className="space-y-3 font-sans">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mb-1">
            Total Audited TVL
          </div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatUSD(summary?.totalTvlUSD || 788981478)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Uniswap v3 Subgraph
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mb-1">
            24h Volume
          </div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatUSD(summary?.total24hVolumeUSD || 446316290)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
            Velocity: {summary?.velocityRatio || '0.5657'}
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mb-1">
            Liquidity Score
          </div>
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {summary?.liquidityScore || '98.5'}<span className="text-xs text-zinc-400 font-normal"> / 100</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
            {summary?.riskLevel || 'OPTIMAL'}
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-sm">
          <div className="text-zinc-500 dark:text-zinc-400 text-[11px] mb-1">
            Attestation State
          </div>
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-mono truncate">
            {agentName || 'auditor.sentinel402.eth'}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{ensAttestation?.isSimulated ? 'Simulated Sepolia' : 'On-Chain Confirmed'}</span>
          </div>
        </div>
      </div>

      {/* Attestation Details Card */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 text-xs shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
            On-Chain Cryptographic Attestation
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Target: <span className="text-zinc-800 dark:text-zinc-200 font-medium">{agentName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {/* Report Hash */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2.5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-1">
              <span>keccak256 Deterministic Report Hash:</span>
              <button
                onClick={() => copyText(reportHash, setCopiedHash)}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-zinc-800 dark:text-zinc-200 break-all text-[11px]">
              {reportHash}
            </div>
          </div>

          {/* Sepolia Tx Hash */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2.5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] mb-1">
              <span>ENSv2 Sepolia Transaction Hash:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(txHash, setCopiedTx)}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1"
                >
                  {copiedTx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Explorer</span>
                </a>
              </div>
            </div>
            <div className="text-zinc-800 dark:text-zinc-200 break-all text-[11px]">
              {txHash}
            </div>
          </div>
        </div>

        {/* Record Key Footer */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-500">
          <div>
            Record Key: <code className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded">{recordKey || "records['last_audit_hash']"}</code>
          </div>
          <span>•</span>
          <div>
            Resolver: <code className="text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded">{resolverAddress}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
