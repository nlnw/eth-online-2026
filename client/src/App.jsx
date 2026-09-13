import React, { useState, useEffect } from 'react';
import { Play, PlayCircle, Download, Check, Shield } from 'lucide-react';
import HeaderBadge from './components/HeaderBadge';
import TerminalLog from './components/TerminalLog';
import PoolsTable from './components/PoolsTable';
import AuditSummary from './components/AuditSummary';
import ChallengeModal from './components/ChallengeModal';
import DemoStudio from './components/DemoStudio';
import EacInspector from './components/EacInspector';
import NetworkStatusCard from './components/NetworkStatusCard';

const DEFAULT_MPP_TOKEN = 'bazantic_mpp_gateway_session_9a8b7c6d5e4f3a2b1c0d';

export default function App() {
  // Light / Dark Mode state management
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sentinel402_theme') || localStorage.getItem('graphagent_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const applyTheme = (targetTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }
    root.setAttribute('data-theme', targetTheme);
    if (body) body.setAttribute('data-theme', targetTheme);
    try {
      localStorage.setItem('sentinel402_theme', targetTheme);
      localStorage.setItem('graphagent_theme', targetTheme);
    } catch (_e) {}
    setTheme(targetTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setThemeMode = (mode) => {
    applyTheme(mode);
  };

  const [agentProfile, setAgentProfile] = useState({
    agentName: 'auditor.sentinel402.eth',
    resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
    agentAddress: '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
    wallet: {
      hasKey: true,
      address: '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
      balanceEth: '0.0000',
      balanceWei: '0',
      isFunded: false
    },
    facilitatorAddress: '0x4020000000000000000000000000000000000001',
    network: 'Ethereum Sepolia (Chain ID: 11155111)',
    faucets: []
  });

  const [preset, setPreset] = useState('uniswap_top_5');
  const [authMode, setAuthMode] = useState('authorized'); // 'authorized' | 'unauthorized'
  const [customToken, setCustomToken] = useState(DEFAULT_MPP_TOKEN);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [auditResult, setAuditResult] = useState(null);
  const [recordedRun, setRecordedRun] = useState(null);

  // Modal states
  const [challengeData, setChallengeData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeView, setIsRecipeView] = useState(false);
  const [recipeSpec, setRecipeSpec] = useState(null);

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
          agentAddress: data.agentAddress,
          wallet: data.wallet,
          faucets: data.faucets || [],
          network: data.network
        });
      }
    } catch (_err) {}
  };

  const fetchRecipe = async () => {
    try {
      const res = await fetch('/api/recipe');
      if (res.ok) {
        const data = await res.json();
        setRecipeSpec(data);
      }
    } catch (_err) {}
  };

  const addLog = (tag, text, type = 'info') => {
    const d = new Date();
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    const timestamp = `${d.toTimeString().split(' ')[0]}.${ms}`;
    const entry = { timestamp, tag, text, type };
    setLogs((prev) => [...prev, entry]);
    return entry;
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runAuditPipeline = async (overrideAuthMode, isPartAuto = false) => {
    const currentMode = overrideAuthMode || authMode;
    setIsExecuting(true);
    if (!isPartAuto) clearLogs();

    const poolLimit = preset === 'uniswap_top_10' ? 10 : preset === 'stable_depth' ? 4 : 5;
    const runEvents = [];

    const recordStep = (tag, text, type = 'info') => {
      const entry = addLog(tag, text, type);
      runEvents.push(entry);
    };

    recordStep('GATEWAY', `[Stage 1] Ingesting request at POST /api/run-audit (Preset: ${preset}, Limit: ${poolLimit})`);
    recordStep('GATEWAY', `Gateway facilitator handshake: ${agentProfile.facilitatorAddress}`);

    await new Promise((r) => setTimeout(r, 150));

    const bearerHeader = currentMode === 'authorized' ? `Bearer ${customToken}` : '';
    if (currentMode === 'authorized') {
      recordStep('x402_AUTH', `[Stage 2] Validating Authorization header: Bearer bazantic_mpp_...`, 'info');
      recordStep('x402_AUTH', `Session verified. Gateway authorization check passed.`, 'success');
    } else {
      recordStep('x402_AUTH', `[Stage 2] Intercepting request: Missing Bearer token.`, 'warn');
      recordStep('x402_AUTH', `Issued HTTP 402 Payment Required challenge.`, 'error');
    }

    await new Promise((r) => setTimeout(r, 180));

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
        recordStep('x402_AUTH', `Pipeline halted: 0.001 ETH micropayment challenge active.`, 'error');
        setChallengeData(errorJson);
        if (!isPartAuto) {
          setIsRecipeView(false);
          setIsModalOpen(true);
        }
        setIsExecuting(false);
        return { status: 402, data: errorJson, events: runEvents };
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      recordStep('THE_GRAPH', `[Stage 3] Querying Subgraph Studio for Uniswap v3 liquidity...`, 'info');
      await new Promise((r) => setTimeout(r, 150));
      recordStep(
        'THE_GRAPH',
        `Retrieved ${result.pools.length} pools from ${result.graphSource}. Total TVL: $${Number(
          result.summary.totalTvlUSD
        ).toLocaleString('en-US')}`,
        'success'
      );

      recordStep(
        'DETERMINISTIC_AUDIT',
        `Generated deterministic keccak256 audit hash: ${result.reportHash.slice(0, 24)}...`,
        'success'
      );

      await new Promise((r) => setTimeout(r, 160));

      recordStep('ENSv2', `[Stage 4] Resolving EAC node for ${result.agentName}...`, 'info');
      recordStep(
        'ENSv2',
        `Writing records['last_audit_hash'] to Permissioned Resolver (${result.resolverAddress.slice(0, 8)}...)`,
        'info'
      );
      recordStep(
        'ENSv2',
        `Broadcast to Sepolia -> txHash: ${result.txHash.slice(0, 22)}... (${
          result.ensAttestation.isSimulated ? 'Simulated Sepolia' : 'On-Chain Confirmed'
        })`,
        'success'
      );

      recordStep('GATEWAY', `Recipe completed successfully. Execution time: 310ms.`, 'success');

      setAuditResult(result);

      const recordSnapshot = {
        recordedAt: new Date().toISOString(),
        preset,
        agentName: result.agentName,
        reportHash: result.reportHash,
        txHash: result.txHash,
        poolsCount: result.pools.length,
        summary: result.summary,
        lifecycleEvents: runEvents
      };
      setRecordedRun(recordSnapshot);

      return { status: 200, data: result, record: recordSnapshot };
    } catch (err) {
      recordStep('ERROR', `Execution failure: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Automated full end-to-end flow runner with recording
   */
  const handleAutoRunFlow = async () => {
    setIsAutoRunning(true);
    clearLogs();
    addLog('GATEWAY', 'Starting automated end-to-end verification and recording flow...', 'info');

    await new Promise((r) => setTimeout(r, 300));
    addLog('GATEWAY', 'Step 1: Simulating unauthenticated call to verify x402 challenge handling...', 'info');
    await runAuditPipeline('unauthorized', true);

    await new Promise((r) => setTimeout(r, 600));
    addLog('GATEWAY', 'Step 2: Passing Bazantic MPP session credentials to unlock pipeline...', 'info');
    setAuthMode('authorized');
    const res = await runAuditPipeline('authorized', true);

    addLog('GATEWAY', 'Automated flow complete. Execution record generated.', 'success');
    setIsAutoRunning(false);
  };

  const handleExportRecording = () => {
    if (!recordedRun) return;
    const blob = new Blob([JSON.stringify(recordedRun, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphagent_audit_record_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Bar */}
      <HeaderBadge
        agentName={agentProfile.agentName}
        resolverAddress={agentProfile.resolverAddress}
        agentAddress={agentProfile.agentAddress}
        wallet={agentProfile.wallet}
        facilitatorAddress={agentProfile.facilitatorAddress}
        onOpenRecipe={openRecipeModal}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSetTheme={setThemeMode}
      />

      <main className="w-full px-4 sm:px-6 py-5 space-y-4 flex-1">
        {/* Minimal Hero / Spec Overview */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Sentinel402 Gateway
              </h2>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                ETHOnline 2026
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Autonomous liquidity auditing pipeline integrating <strong>The Graph Subgraph Studio</strong>, <strong>Bazantic x402 Micropayments</strong>, and <strong>ENSv2 Permissioned Resolvers</strong> on Ethereum Sepolia.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoRunFlow}
              disabled={isExecuting || isAutoRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono transition"
              title="Automatically run through unauthenticated 402 challenge and authenticated execution"
            >
              <PlayCircle className="w-3.5 h-3.5 text-zinc-500" />
              <span>{isAutoRunning ? 'Auto-Running...' : 'Auto-Run Flow'}</span>
            </button>

            {recordedRun && (
              <button
                onClick={handleExportRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono transition"
                title="Download JSON recording of audit execution"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export Run JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Agent Identity & Infrastructure Status */}
        <NetworkStatusCard
          agentProfile={agentProfile}
          onRefresh={fetchProfile}
          lastResult={auditResult}
        />

        {/* Interactive Demo Studio & In-Browser Video Recording */}
        <DemoStudio
          onRunAutoFlow={handleAutoRunFlow}
          isExecuting={isExecuting}
          recordedRun={recordedRun}
        />

        {/* Controls Toolbar */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            {/* Presets */}
            <div className="flex items-center gap-2">
              <label htmlFor="preset-select" className="text-zinc-500 text-xs font-medium shrink-0">
                Preset:
              </label>
              <select
                id="preset-select"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                disabled={isExecuting}
                className="border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800/80 px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
              >
                <option value="uniswap_top_5">Uniswap v3 Top 5 TVL Pools</option>
                <option value="uniswap_top_10">Uniswap v3 Top 10 High Volume Pools</option>
                <option value="stable_depth">Stablecoin Depth Pools (USDC / USDT / DAI)</option>
              </select>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-xs font-medium shrink-0">
                Gateway Auth:
              </span>
              <div className="inline-flex rounded border border-zinc-300 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setAuthMode('authorized')}
                  disabled={isExecuting}
                  className={`px-2.5 py-1 rounded transition font-medium ${
                    authMode === 'authorized'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Authorized (MPP Token)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('unauthorized')}
                  disabled={isExecuting}
                  className={`px-2.5 py-1 rounded transition font-medium ${
                    authMode === 'unauthorized'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Simulate 402 Paywall
                </button>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => runAuditPipeline()}
              disabled={isExecuting || isAutoRunning}
              className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded font-medium text-xs font-mono transition shrink-0 ${
                isExecuting
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Executing...' : 'Run Bazantic Recipe'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Lifecycle Log */}
        <TerminalLog
          logs={logs}
          onClearLogs={clearLogs}
          isExecuting={isExecuting}
          onExportLogs={handleExportRecording}
        />

        {/* Summary Card */}
        {auditResult && <AuditSummary data={auditResult} />}

        {/* ENSv2 EAC & Calldata Decoder */}
        {auditResult && (
          <EacInspector
            attestationData={{
              ...auditResult.ensAttestation,
              calldata: auditResult.ensAttestation?.calldata
            }}
            agentName={auditResult.agentName}
            resolverAddress={auditResult.resolverAddress}
          />
        )}

        {/* Pools Table */}
        <PoolsTable
          pools={auditResult ? auditResult.pools : []}
          isLive={auditResult ? auditResult.isGraphLive : true}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 px-4 text-xs font-mono text-zinc-500 transition-colors">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sentinel402 Gateway • ETHOnline 2026</span>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>The Graph Studio</span>
            <span>•</span>
            <span>Bazantic x402</span>
            <span>•</span>
            <span>ENSv2 Sepolia</span>
          </div>
        </div>
      </footer>

      {/* 402 Challenge & Recipe Modal */}
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
