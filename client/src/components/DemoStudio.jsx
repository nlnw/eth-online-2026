import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Play, RotateCcw, Download, BookOpen, Check, AlertCircle, ChevronRight, X } from 'lucide-react';

export default function DemoStudio({
  onRunAutoFlow,
  isExecuting,
  recordedRun,
  onReplayRun,
  isReplaying
}) {
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [activeScriptStep, setActiveScriptStep] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  /**
   * Start in-browser video screen recording
   */
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', frameRate: 30 },
        audio: false
      });

      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graphagent_demo_recording_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecordingVideo(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setRecordingTime(0);

        // Stop all stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Handle user stopping screen share from browser native UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start(500);
      setIsRecordingVideo(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Screen recording cancelled or not supported:', err);
    }
  };

  /**
   * Stop video recording and trigger download
   */
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const SCRIPT_STEPS = [
    {
      title: "1. The Problem: AI Agents Lack Verifiable Data & Native Monetization",
      narration: "Autonomous agents making financial decisions need authenticated indexing without trusting centralized servers. Furthermore, running indexers and on-chain attestations incurs compute costs that traditional HTTP APIs cannot monetize autonomously."
    },
    {
      title: "2. Bazantic x402 Micropayment Interception",
      narration: "When an unauthenticated agent requests POST /api/run-audit, our gateway halts execution and issues an RFC-compliant HTTP 402 Payment Required response. The payload requires a 0.001 ETH micropayment challenge settled via the Bazantic facilitator at 0x4020...0001."
    },
    {
      title: "3. Live The Graph Subgraph Studio Indexing",
      narration: "Once the Bazantic Bearer token is verified, the gateway dispatches a live GraphQL query to The Graph Subgraph Studio for Uniswap v3 pool metrics (USDC/WETH, WBTC/WETH). It models liquidity depth and computes a deterministic keccak256 hash of the normalized state."
    },
    {
      title: "4. ENSv2 Permissioned Resolver Attestation",
      narration: "Using viem on Ethereum Sepolia, the gateway interacts with the ENSv2 Permissioned Resolver contract. Under Execution Access Control (EAC), it commits the audit hash into records['last_audit_hash'] for subname auditor.sentinel402.eth."
    },
    {
      title: "5. On-Chain Cryptographic Verification",
      narration: "Anyone can read the public resolver to verify that the agent's published state exactly matches the on-chain attestation receipt. The entire pipeline is recorded deterministically."
    }
  ];

  return (
    <>
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Demo Studio title */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-sans text-xs">
              Demo Studio
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Live Flow & Browser Recording
            </span>
          </div>

          {/* Center/Right: Recording & Demo Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Run Auto Flow */}
            <button
              onClick={onRunAutoFlow}
              disabled={isExecuting || isReplaying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-xs transition"
              title="Run complete 402-to-attestation flow with live logs"
            >
              <Play className="w-3.5 h-3.5 fill-current text-zinc-600 dark:text-zinc-400" />
              <span>{isExecuting ? 'Running Flow...' : 'Auto-Run Demo Flow'}</span>
            </button>

            {/* In-Browser Screen Recorder */}
            {isRecordingVideo ? (
              <button
                onClick={stopVideoRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-mono text-xs transition animate-pulse"
                title="Stop and save video recording (.webm)"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Stop Recording ({formatTimer(recordingTime)})</span>
              </button>
            ) : (
              <button
                onClick={startVideoRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs transition"
                title="Record video of this demo tab (.webm)"
              >
                <Video className="w-3.5 h-3.5 text-zinc-500" />
                <span>Record Video (.webm)</span>
              </button>
            )}

            {/* View Presentation Script */}
            <button
              onClick={() => setShowScriptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs transition"
              title="Open presentation script walkthrough"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>Demo Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Presentation Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-lg text-xs">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  ETHOnline 2026 Presentation Walkthrough Script
                </h3>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                Use this step-by-step narrative during your 2–3 minute video recording or live demo submission:
              </div>

              <div className="space-y-3">
                {SCRIPT_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className={`border rounded p-3 transition-colors ${
                      activeScriptStep === idx
                        ? 'border-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-600'
                        : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950'
                    }`}
                    onClick={() => setActiveScriptStep(idx)}
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100 text-xs mb-1">
                      <span>{step.title}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Step {idx + 1}/5</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed font-serif">
                      "{step.narration}"
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200">Suggested Action Flow:</div>
                <div>1. Click "Record Video (.webm)" above to start browser capture.</div>
                <div>2. Read Step 1 &amp; 2 &rarr; Click "Simulate 402 Paywall" to demonstrate the Bazantic challenge.</div>
                <div>3. Click "Pass Bazantic MPP Bearer Token" to show payment unlocking.</div>
                <div>4. Watch The Graph Subgraph Studio metrics index and deterministic hash generate.</div>
                <div>5. Inspect the ENSv2 Permissioned Resolver textRecord write and transaction hash.</div>
                <div>6. Click "Stop Recording" to automatically download your video!</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition text-xs font-mono"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setShowScriptModal(false);
                  onRunAutoFlow();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium transition text-xs font-mono"
              >
                <span>Trigger Auto-Run Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
