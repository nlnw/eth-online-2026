import React, { useState } from 'react';
import { Shield, Sun, Moon, Copy, Check, FileCode, CheckCircle } from 'lucide-react';

export default function HeaderBadge({
  agentName,
  resolverAddress,
  agentAddress,
  wallet,
  facilitatorAddress,
  onOpenRecipe,
  theme,
  onToggleTheme,
  onSetTheme
}) {
  const [copiedResolver, setCopiedResolver] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);

  const copyResolver = () => {
    if (!resolverAddress) return;
    navigator.clipboard.writeText(resolverAddress);
    setCopiedResolver(true);
    setTimeout(() => setCopiedResolver(false), 1500);
  };

  const copyAgent = () => {
    const addr = agentAddress || wallet?.address;
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopiedAgent(true);
    setTimeout(() => setCopiedAgent(false), 1500);
  };

  const isFunded = wallet?.isFunded || false;
  const balanceEth = wallet?.balanceEth || '0.0000';
  const displayAddress = agentAddress || wallet?.address || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f';

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40 transition-colors">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Project identity */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sentinel402 Gateway
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Sepolia
            </span>
          </div>
        </div>

        {/* Center: Agent identity subname & keypair balance */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300">
            <span className={`w-1.5 h-1.5 rounded-full ${isFunded ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-zinc-500 dark:text-zinc-400">Subname:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {agentName || 'auditor.sentinel402.eth'}
            </span>
            <span className="text-[10px] text-zinc-500 ml-1">ENSv2 EAC</span>
          </div>

          <button
            onClick={copyAgent}
            className="flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition text-[11px]"
            title={`Agent Key: ${displayAddress} (Balance: ${balanceEth} Sepolia ETH)`}
          >
            <span className="text-zinc-500">Agent:</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
              {`${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`}
            </span>
            <span className={`text-[10px] px-1 py-0.2 rounded border ${isFunded ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'}`}>
              {balanceEth} ETH
            </span>
            {copiedAgent ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
          </button>

          <button
            onClick={copyResolver}
            className="flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition text-[11px]"
            title={`Resolver: ${resolverAddress}`}
          >
            <span>Resolver:</span>
            <span className="text-zinc-700 dark:text-zinc-300">
              {resolverAddress ? `${resolverAddress.slice(0, 6)}...${resolverAddress.slice(-4)}` : '0x...'}
            </span>
            {copiedResolver ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
          </button>
        </div>

        {/* Right: Controls & Theme Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
            <Shield className="w-3 h-3 text-zinc-500" />
            <span>x402 MPP</span>
          </div>

          <button
            onClick={onOpenRecipe}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition text-xs font-mono"
            title="Inspect Bazantic Recipe Schema"
          >
            <FileCode className="w-3.5 h-3.5 text-zinc-500" />
            <span>Recipe Spec</span>
          </button>

          {/* Segmented Theme Switcher */}
          <div className="inline-flex items-center rounded border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-800/80 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => (onSetTheme ? onSetTheme('light') : onToggleTheme?.())}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                theme === 'light'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Activate Light Mode"
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => (onSetTheme ? onSetTheme('dark') : onToggleTheme?.())}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                theme === 'dark'
                  ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Activate Dark Mode"
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
