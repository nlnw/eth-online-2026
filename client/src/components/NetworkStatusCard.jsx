import React, { useState } from 'react';
import { Wallet, Shield, Database, Copy, Check, ExternalLink, RefreshCw, Key } from 'lucide-react';

export default function NetworkStatusCard({ agentProfile, onRefresh, lastResult }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const wallet = agentProfile?.wallet || {};
  const isFunded = wallet.isFunded || false;
  const balanceEth = wallet.balanceEth || '0.0000';
  const address = agentProfile?.agentAddress || wallet.address || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f';
  const subname = agentProfile?.agentName || 'oracle.agentcorp.eth';
  const resolver = agentProfile?.resolverAddress || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1500);
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Live Agent Identity & Infrastructure
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Chain ID 11155111
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          title="Refresh on-chain balance"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Column 1: Agent Keypair */}
        <div className="space-y-2 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Agent Wallet Keypair</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border ${isFunded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {isFunded ? 'Funded (Live Txs)' : 'Unfunded (Simulation)'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate" title={address}>
              {`${address.slice(0, 8)}...${address.slice(-6)}`}
            </span>
            <button
              onClick={copyAddress}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition shrink-0"
              title="Copy wallet address"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Sepolia Balance:</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{balanceEth} ETH</span>
          </div>

          {/* Faucet Links */}
          <div className="pt-1 flex items-center gap-2 text-[10px]">
            <span className="text-zinc-400">Faucets:</span>
            <a
              href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Google <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <a
              href="https://www.alchemy.com/faucets/ethereum-sepolia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:underline"
            >
              Alchemy <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Column 2: ENSv2 Subname Attestation */}
        <div className="space-y-2 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">ENSv2 Subname Target</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
              EAC Scoped
            </span>
          </div>

          <div className="text-zinc-800 dark:text-zinc-200 font-medium truncate">
            {subname}
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Record Key:</span>
            <span className="text-zinc-700 dark:text-zinc-300 text-[10px]">records['last_audit_hash']</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Resolver:</span>
            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]" title={resolver}>
              {`${resolver.slice(0, 6)}...${resolver.slice(-4)}`}
            </span>
          </div>
        </div>

        {/* Column 3: Live Market Data Stream */}
        <div className="space-y-2 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Market Data Ingest</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Live Stream
            </span>
          </div>

          <div className="text-zinc-800 dark:text-zinc-200 font-medium truncate" title="The Graph & Uniswap v3 Mainnet">
            The Graph & Uniswap v3
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Integrity Hash:</span>
            <span className="text-zinc-700 dark:text-zinc-300 text-[10px]">keccak256 JSON</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Protocol Auth:</span>
            <span className="text-zinc-700 dark:text-zinc-300">Bazantic x402 MPP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
