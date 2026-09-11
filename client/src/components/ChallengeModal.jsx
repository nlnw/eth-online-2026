import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, X, Zap, Code2, ArrowRight } from 'lucide-react';

export default function ChallengeModal({ isOpen, onClose, challengeData, onAuthorizeAndPay, isRecipeView, recipeData }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1422] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl font-mono text-xs animate-scaleUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#12192c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isRecipeView ? (
              <>
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Bazantic Recipe Specification</h3>
              </>
            ) : (
              <>
                <div className="p-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    HTTP 402 — Payment Required
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px]">
                      x402 Protocol
                    </span>
                  </h3>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-300">
          {isRecipeView ? (
            /* Recipe Schema Viewer */
            <div className="space-y-3">
              <div className="text-slate-400 text-xs leading-relaxed">
                Declarative multi-step pipeline executing across Bazantic x402 Gateway, The Graph Subgraph Studio, and ENSv2 Sepolia Permissioned Resolvers:
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed max-h-96">
                {JSON.stringify(recipeData || challengeData, null, 2)}
              </pre>
            </div>
          ) : (
            /* 402 Challenge Inspector */
            <div className="space-y-4">
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5 text-rose-200">
                <p className="font-semibold mb-1">
                  Bazantic Gateway Interception Notice
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The requested endpoint <code className="text-rose-300 font-mono">POST /api/run-audit</code> is guarded by the Bazantic x402 Micropayment Protocol. Unauthenticated requests are halted before indexer compute or on-chain attestation occurs.
                </p>
              </div>

              {/* Challenge Parameters Table */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
                <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>Structured x402 Payment Challenge</span>
                  <span className="text-[10px] text-purple-400">RFC 9402 Compliance</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Scheme:</span>{' '}
                    <span className="text-cyan-400 font-bold">{challengeData?.challenge?.scheme || 'x402'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Required Price:</span>{' '}
                    <span className="text-emerald-400 font-bold">{challengeData?.challenge?.amount || '0.001'} ETH</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Facilitator Address:</span>{' '}
                    <span className="text-purple-300 break-all">{challengeData?.challenge?.facilitator || '0x4020000000000000000000000000000000000001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Network:</span>{' '}
                    <span className="text-slate-200">Sepolia (Chain 11155111)</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pricing Tier:</span>{' '}
                    <span className="text-slate-200">{challengeData?.challenge?.pricingTier || 'audit-compute-standard'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Required Header:</span>{' '}
                    <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">Authorization: Bearer bazantic_mpp_&lt;token&gt;</code>
                  </div>
                </div>
              </div>

              {/* Raw JSON Challenge */}
              <div>
                <div className="text-slate-400 text-[11px] mb-1 font-semibold">Raw Server Response (HTTP 402):</div>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto text-[10px] max-h-36">
                  {JSON.stringify(challengeData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#12192c] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            Dismiss
          </button>

          {!isRecipeView && onAuthorizeAndPay && (
            <button
              onClick={onAuthorizeAndPay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold transition shadow-lg shadow-purple-900/30"
            >
              <span>Authorize & Pay 0.001 ETH via Bazantic MPP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
