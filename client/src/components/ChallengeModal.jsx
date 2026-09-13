import React from 'react';
import { X, ArrowRight, ShieldAlert, Code2 } from 'lucide-react';

export default function ChallengeModal({
  isOpen,
  onClose,
  challengeData,
  onAuthorizeAndPay,
  isRecipeView,
  recipeData
}) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-lg text-xs">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRecipeView ? (
              <>
                <Code2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  Bazantic Declarative Recipe Specification
                </h3>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                    HTTP 402 Payment Required
                  </h3>
                  <span className="px-1.5 py-0.2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono">
                    x402 Protocol
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-btn"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-3 text-zinc-700 dark:text-zinc-300">
          {isRecipeView ? (
            <div className="space-y-2">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                Declarative 3-stage execution pipeline linking Bazantic Gateway, The Graph Subgraph Studio, and ENSv2 Sepolia Resolver:
              </p>
              <pre className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-200 overflow-x-auto max-h-80">
                {JSON.stringify(recipeData || challengeData, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded p-3 text-xs">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                  Bazantic x402 Micropayment Intercepted
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Endpoint <code className="font-mono text-zinc-800 dark:text-zinc-200">POST /api/run-audit</code> requires authorization via the Bazantic Gateway. Execution is halted before indexer queries or on-chain writes proceed.
                </div>
              </div>

              {/* Challenge Parameters */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Scheme:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{challengeData?.challenge?.scheme || 'x402'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Required Amount:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{challengeData?.challenge?.amount || '0.001'} ETH</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Network:</span>
                  <span className="text-zinc-900 dark:text-zinc-100">Ethereum Sepolia (11155111)</span>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Facilitator:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 break-all">{challengeData?.challenge?.facilitator || '0x4020000000000000000000000000000000000001'}</span>
                </div>
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-zinc-500">Required Header:</span>
                  <code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">Authorization: Bearer bazantic_mpp_&lt;token&gt;</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-footer-btn"
            className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition text-xs font-mono cursor-pointer"
          >
            Close
          </button>

          {!isRecipeView && onAuthorizeAndPay && (
            <button
              onClick={onAuthorizeAndPay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium transition text-xs font-mono"
            >
              <span>Pass Bazantic MPP Bearer Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
