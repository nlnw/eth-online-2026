import { useState } from 'react';
import { ShieldCheck, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export default function EacInspector({ attestationData, agentName, resolverAddress }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCalldata, setCopiedCalldata] = useState(false);

  if (!attestationData) return null;

  const node = attestationData.node || '0x565fcce98418c084548b6a39380a6c4ac9eb92e9a8fde232fd8d99ece5e66d20';
  const calldata = attestationData.calldata || '';
  const isSimulated = attestationData.isSimulated ?? true;

  const copyCalldata = () => {
    if (!calldata) return;
    navigator.clipboard.writeText(calldata);
    setCopiedCalldata(true);
    setTimeout(() => setCopiedCalldata(false), 1500);
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md overflow-hidden text-xs shadow-xs transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-left"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-sans text-xs">
            ENSv2 Execution Access Control (EAC) &amp; Calldata Decoder
          </span>
          <span className="px-1.5 py-0.2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            {isSimulated ? 'Deterministic Sepolia Mock' : 'On-Chain Broadcast'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-zinc-500 font-mono text-[11px]">
          <span>{isOpen ? 'Collapse' : 'Inspect ABI Calldata'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-[11px]">
          {/* Architecture comparison */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded font-sans text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">How ENSv2 is used: </span>
            In ENSv1, resolvers required full root ownership. ENSv2 introduces <strong>Execution Access Control (EAC)</strong> permissioned resolvers. Our AI agent is granted scoped write permission exclusively for key <code className="font-mono text-zinc-800 dark:text-zinc-200">records['last_audit_hash']</code> under subname <code className="font-mono text-zinc-800 dark:text-zinc-200">{agentName || 'auditor.sentinel402.eth'}</code> without compromising root domain authority.
          </div>

          {/* Decoded Parameters Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
            <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              Decoded EVM Contract Call
            </div>
            <div className="p-3 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                <span className="text-zinc-500">Method:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  setText(bytes32 node, string key, string value)
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-2">
                <span className="text-zinc-500 shrink-0">Node (namehash):</span>
                <span className="text-zinc-800 dark:text-zinc-200 break-all text-right">
                  {node}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
                <span className="text-zinc-500">Key:</span>
                <code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  records['last_audit_hash']
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2">
                <span className="text-zinc-500">Resolver Contract:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-800 dark:text-zinc-200">{resolverAddress}</span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${resolverAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                  >
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Raw EVM Calldata */}
          {calldata && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                <span>Raw ABI-Encoded Calldata ({calldata.length / 2 - 1} bytes):</span>
                <button
                  onClick={copyCalldata}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1"
                >
                  {copiedCalldata ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCalldata ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] leading-relaxed break-all text-zinc-700 dark:text-zinc-300 max-h-24 overflow-y-auto">
                {calldata}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
