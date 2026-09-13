import { useState } from 'react';
import { Cpu, Play, CheckCircle2, Copy, Check, Download, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function McpConsole({ agentName, onExportRecording, hasAuditRun }) {
  const [activeTool, setActiveTool] = useState('audit_pool_liquidity');
  const [isRunning, setIsRunning] = useState(false);
  const [mcpResponse, setMcpResponse] = useState(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const claudeConfig = JSON.stringify({
    mcpServers: {
      sentinel402: {
        command: "node",
        args: ["scripts/mcp_server.js"],
        env: {
          SEPOLIA_RPC_URL: "https://rpc.ankr.com/eth_sepolia",
          ENS_AGENT_SUBNAME: agentName || "auditor.sentinel402.eth"
        }
      }
    }
  }, null, 2);

  const copyConfig = () => {
    navigator.clipboard.writeText(claudeConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 1500);
  };

  const handleSimulateToolCall = async () => {
    setIsRunning(true);
    setMcpResponse(null);

    const rpcPayload = {
      jsonrpc: "2.0",
      id: `call_${Date.now().toString(36)}`,
      method: "tools/call",
      params: {
        name: activeTool,
        arguments: activeTool === 'audit_pool_liquidity' ? { limit: 5, preset: 'uniswap_top_5' } : { subname: agentName || 'auditor.sentinel402.eth' }
      }
    };

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload)
      });
      const data = await res.json();
      setMcpResponse({ request: rpcPayload, response: data, timestamp: new Date().toISOString() });
    } catch (err) {
      setMcpResponse({
        request: rpcPayload,
        response: { error: err.message },
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-4 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Model Context Protocol (MCP) • AI Agent Tools
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active (/api/mcp)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700"
          >
            <span>Claude / Cursor Config</span>
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {hasAuditRun && onExportRecording && (
            <button
              onClick={onExportRecording}
              className="flex items-center gap-1 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition"
              title="Download full execution JSON with keccak256 hash"
            >
              <Download className="w-3 h-3 text-zinc-500" />
              <span>Export Signed Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Claude Config Snippet Accordion */}
      {showConfig && (
        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-[11px]">Claude Desktop (~/Library/Application Support/Claude/claude_desktop_config.json):</span>
            <button
              onClick={copyConfig}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              {copiedConfig ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500" />}
              <span>{copiedConfig ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[11px] overflow-x-auto text-zinc-700 dark:text-zinc-300">{claudeConfig}</pre>
        </div>
      )}

      {/* Tool Selector & Run Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">Select Tool:</span>
          <div className="inline-flex rounded border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTool('audit_pool_liquidity')}
              className={`px-2.5 py-1 rounded transition ${
                activeTool === 'audit_pool_liquidity'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              audit_pool_liquidity
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('get_ens_attestation')}
              className={`px-2.5 py-1 rounded transition ${
                activeTool === 'get_ens_attestation'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              get_ens_attestation
            </button>
          </div>
        </div>

        <button
          onClick={handleSimulateToolCall}
          disabled={isRunning}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold transition ${
            isRunning
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Invoking MCP Endpoint...' : 'Simulate Claude / Agent Tool Call'}</span>
        </button>
      </div>

      {/* Description of active tool */}
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 font-mono">
        {activeTool === 'audit_pool_liquidity' && (
          <span>Queries The Graph Subgraph Studio, scores liquidity depth, generates keccak256 hash, and writes attestation to Sepolia ENSv2.</span>
        )}
        {activeTool === 'get_ens_attestation' && (
          <span>Reads verified audit hash directly from the ENSv2 Permissioned Resolver for {agentName || 'auditor.sentinel402.eth'}.</span>
        )}
      </div>

      {/* MCP Live Execution Console */}
      {mcpResponse ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-950 p-3 text-zinc-300 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              JSON-RPC 2.0 Call Succeeded
            </span>
            <span className="text-zinc-500">{mcpResponse.timestamp}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-zinc-500 block mb-1">Agent Request (Claude / Cursor):</span>
              <pre className="p-2 rounded bg-zinc-900/90 text-zinc-300 overflow-x-auto max-h-48 border border-zinc-800">
                {JSON.stringify(mcpResponse.request, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">Sentinel402 MCP Result:</span>
              <pre className="p-2 rounded bg-zinc-900/90 text-emerald-300 overflow-x-auto max-h-48 border border-zinc-800">
                {JSON.stringify(mcpResponse.response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-4 text-center text-xs text-zinc-400 font-mono">
          <Terminal className="w-5 h-5 mx-auto mb-1 text-zinc-400 opacity-60" />
          <span>Click "Simulate Claude / Agent Tool Call" to trigger live JSON-RPC execution over the Model Context Protocol.</span>
        </div>
      )}
    </div>
  );
}
