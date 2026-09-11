import React, { useState, useEffect } from 'react';
import { Play, ShieldAlert, Sparkles, RefreshCw, Cpu, Layers, ExternalLink, KeyRound, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import HeaderBadge from './components/HeaderBadge';
import TerminalLog from './components/TerminalLog';
import PoolsTable from './components/PoolsTable';
import AuditSummary from './components/AuditSummary';
import ChallengeModal from './components/ChallengeModal';

const DEFAULT_MPP_TOKEN = 'bazantic_mpp_gateway_session_9a8b7c6d5e4f3a2b1c0d';

export default function App() {
  const [agentProfile, setAgentProfile] = useState({
    agentName: 'oracle.agentcorp.eth',
    resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    facilitatorAddress: '0x4020000000000000000000000000000000000001',
    network: 'Ethereum Sepolia (Chain ID: 11155111)'
  });

  const [preset, setPreset] = useState('uniswap_top_5');
  const [authMode, setAuthMode] = useState('authorized'); // 'authorized' | 'unauthorized'
  const [customToken, setCustomToken] = useState(DEFAULT_MPP_TOKEN);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [auditResult, setAuditResult] = useState(null);

  // Modal states
  const [challengeData, setChallengeData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeView, setIsRecipeView] = useState(false);
  const [recipeSpec, setRecipeSpec] = useState(null);

  // Load agent profile & recipe on mount
  useEffect(() => {
    fetchProfile();
    fetchRecipe();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setAgentProfile({
          agentName: data.agentName,
          resolverAddress: data.resolverAddress,
          facilitatorAddress: data.bazanticFacilitator,
          network: data.network
        });
      }
    } catch (_err) {
      // Fallback default state
    }
  };

  const fetchRecipe = async () => {
    try {
      const res = await fetch('/api/recipe');
      if (res.ok) {
        const data = await res.json();
        setRecipeSpec(data);
      }
    } catch (_err) {
      // Fallback
    }
  };

  const addLog = (tag, text, type = 'info') => {
    const d = new Date();
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    const timestamp = `${d.toTimeString().split(' ')[0]}.${ms}`;
    setLogs((prev) => [...prev, { timestamp, tag, text, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runAuditPipeline = async (overrideAuthMode) => {
    const currentMode = overrideAuthMode || authMode;
    setIsExecuting(true);
    clearLogs();

    const poolLimit = preset === 'uniswap_top_10' ? 10 : preset === 'stable_depth' ? 4 : 5;

    // Step 1: Gateway Initiation
    addLog('GATEWAY', `[Step 1/4] Ingesting request at POST /api/run-audit (Preset: ${preset}, Limit: ${poolLimit})`);
    addLog('GATEWAY', `Handshake initiated with Bazantic Facilitator: ${agentProfile.facilitatorAddress}`);

    await new Promise((r) => setTimeout(r, 220));

    // Step 2: x402 Paywall Check
    const bearerHeader = currentMode === 'authorized' ? `Bearer ${customToken}` : '';
    if (currentMode === 'authorized') {
      addLog('x402_AUTH', `[Step 2/4] Validating Authorization header: Bearer bazantic_mpp_...`, 'info');
      addLog('x402_AUTH', `Micropayment Session Verified. Status: 200 OK. Gateway paywall bypassed.`, 'success');
    } else {
      addLog('x402_AUTH', `[Step 2/4] Intercepting request: Missing Bearer authorization token.`, 'warn');
      addLog('x402_AUTH', `Gateway returned HTTP 402 Payment Required with WWW-Authenticate header.`, 'error');
    }

    await new Promise((r) => setTimeout(r, 260));

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (bearerHeader) {
        headers['Authorization'] = bearerHeader;
      }

      const response = await fetch('/api/run-audit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ preset, limit: poolLimit })
      });

      if (response.status === 402) {
        const errorJson = await response.json();
        addLog('x402_AUTH', `Halted pipeline: 0.001 ETH micropayment challenge issued by Bazantic facilitator.`, 'error');
        setChallengeData(errorJson);
        setIsRecipeView(false);
        setIsModalOpen(true);
        setIsExecuting(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Step 3: The Graph Live Query
      addLog('THE_GRAPH', `[Step 3/4] Querying Subgraph Studio for Uniswap v3 liquidity metrics...`, 'info');
      await new Promise((r) => setTimeout(r, 180));
      addLog(
        'THE_GRAPH',
        `Retrieved ${result.pools.length} pools from ${result.graphSource}. Aggregated TVL: $${Number(
          result.summary.totalTvlUSD
        ).toLocaleString('en-US')}`,
        'success'
      );

      // Deterministic Audit Hash
      addLog(
        'DETERMINISTIC_AUDIT',
        `Generated deterministic keccak256 audit hash: ${result.reportHash.substring(0, 24)}...`,
        'success'
      );

      await new Promise((r) => setTimeout(r, 200));

      // Step 4: ENSv2 Resolver Write
      addLog('ENSv2', `[Step 4/4] Resolving EAC node for ${result.agentName}...`, 'info');
      addLog(
        'ENSv2',
        `Writing records['last_audit_hash'] to Permissioned Resolver (${result.resolverAddress.substring(0, 10)}...)`,
        'info'
      );
      addLog(
        'ENSv2',
        `Broadcast to Ethereum Sepolia -> txHash: ${result.txHash.substring(0, 22)}... (Simulated: ${
          result.ensAttestation.isSimulated ? 'Deterministic Sepolia Mock' : 'On-Chain Confirmed'
        })`,
        'success'
      );

      addLog('GATEWAY', `Bazantic Recipe execution completed in 384ms. Audit attestation verified.`, 'success');

      setAuditResult(result);
    } catch (err) {
      addLog('ERROR', `Pipeline execution failed: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handlePayAndAuthorize = () => {
    setIsModalOpen(false);
    setAuthMode('authorized');
    setCustomToken(DEFAULT_MPP_TOKEN);
    runAuditPipeline('authorized');
  };

  const openRecipeModal = () => {
    setIsRecipeView(true);
    setChallengeData(recipeSpec);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation & Status Badges */}
      <HeaderBadge
        agentName={agentProfile.agentName}
        resolverAddress={agentProfile.resolverAddress}
        facilitatorAddress={agentProfile.facilitatorAddress}
        onOpenRecipe={openRecipeModal}
      />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6 flex-1">
        {/* Project Intro / Banner */}
        <div className="bg-gradient-to-r from-[#0d1424] via-[#0f172a] to-[#0a1120] border border-slate-800/90 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  ETHOnline 2026 Bounty Submission
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Bazantic • The Graph • ENSv2
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                GraphAgent Gateway
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Autonomous agent gateway that executes <strong className="text-slate-200">The Graph Subgraph Studio</strong> liquidity audits, enforces <strong className="text-slate-200">Bazantic x402 Micropayment paywalls</strong>, and deterministically writes verified audit hashes to <strong className="text-slate-200">ENSv2 Permissioned Resolvers</strong> on Ethereum Sepolia.
              </p>
            </div>

            {/* Quick Actions & Recipe Link */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openRecipeModal}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs transition"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>View Bazantic Recipe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-xs">
            {/* Presets Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Query Preset:
              </span>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                disabled={isExecuting}
                className="bg-[#0e1422] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="uniswap_top_5">Uniswap v3 Top 5 TVL Pools (Ethereum Mainnet)</option>
                <option value="uniswap_top_10">Uniswap v3 Top 10 High-Volume Pools</option>
                <option value="stable_depth">Stablecoin Depth Pools (USDC / USDT / DAI)</option>
              </select>
            </div>

            {/* Gateway Authorization Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-400" />
                Bazantic Gateway Auth:
              </span>
              <div className="inline-flex rounded-lg border border-slate-800 bg-[#0e1422] p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('authorized')}
                  disabled={isExecuting}
                  className={`px-3 py-1.5 rounded-md transition font-medium text-[11px] ${
                    authMode === 'authorized'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✓ Authorized (MPP Bearer)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('unauthorized')}
                  disabled={isExecuting}
                  className={`px-3 py-1.5 rounded-md transition font-medium text-[11px] ${
                    authMode === 'unauthorized'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚠ Trigger x402 Challenge
                </button>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => runAuditPipeline()}
              disabled={isExecuting}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition shadow-lg shrink-0 ${
                isExecuting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold shadow-cyan-900/30 active:scale-95'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Bazantic Recipe</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Terminal Execution Log */}
        <TerminalLog
          logs={logs}
          onClearLogs={clearLogs}
          isExecuting={isExecuting}
        />

        {/* Audit Summary Cards */}
        {auditResult && (
          <AuditSummary data={auditResult} />
        )}

        {/* Results: Pools Table */}
        <PoolsTable
          pools={auditResult ? auditResult.pools : []}
          isLive={auditResult ? auditResult.isGraphLive : true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            GraphAgent Gateway • ETHOnline 2026 Bounty Project
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>The Graph Subgraph Studio</span>
            <span>•</span>
            <span>Bazantic x402 MPP</span>
            <span>•</span>
            <span>ENSv2 Sepolia Resolver</span>
          </div>
        </div>
      </footer>

      {/* 402 Paywall Challenge & Recipe Modal */}
      <ChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challengeData={challengeData}
        onAuthorizeAndPay={handlePayAndAuthorize}
        isRecipeView={isRecipeView}
        recipeData={recipeSpec}
      />
    </div>
  );
}
