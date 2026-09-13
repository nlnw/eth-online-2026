#!/usr/bin/env node

/**
 * Sentinel402 Gateway - Automated Playwright Screen Demo Recorder
 * 
 * Automatically controls Chromium at 1440x810 (16:9 widescreen YouTube format),
 * executing visual actions synchronized with recordings/demo_voiceover.mp3 (~174s).
 * 
 * Features:
 *   - Futuristic on-screen Scene Director HUD with live glowing act indicators
 *   - Laser beam horizon sweep & ambient lens flare transition between scenes
 *   - Glowing interactive virtual cursor with tactile click ripples
 *   - Automated audio-video muxing with burned-in subtitles via scripts/mux_video.sh
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const VIDEO_DIR = path.join(ROOT_DIR, 'recordings', 'videos');

const USER_LIB_DIR = path.join(process.env.HOME || '/home/ubuntu', '.local/share/mamba/envs/browser-libs/lib');
if (fs.existsSync(USER_LIB_DIR)) {
  process.env.LD_LIBRARY_PATH = `${USER_LIB_DIR}:${process.env.LD_LIBRARY_PATH || ''}`;
}

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let currentCursorX = 720;
let currentCursorY = 405;

async function updateCursor(page, x, y) {
  currentCursorX = x;
  currentCursorY = y;
  await page.evaluate(({ x, y }) => {
    const cur = document.getElementById('virtual-cursor');
    if (cur) {
      cur.style.left = `${x}px`;
      cur.style.top = `${y}px`;
    }
  }, { x, y });
}

// Helper: Smooth mouse move with virtual cursor
async function smoothMove(page, targetSelector, steps = 18) {
  try {
    const el = await page.$(targetSelector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;

    const targetX = Math.round(box.x + box.width / 2);
    const targetY = Math.round(box.y + box.height / 2);

    const startX = currentCursorX;
    const startY = currentCursorY;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const curX = Math.round(startX + (targetX - startX) * ease);
      const curY = Math.round(startY + (targetY - startY) * ease);
      await page.mouse.move(curX, curY);
      await updateCursor(page, curX, curY);
      await wait(16);
    }
    await wait(200);
  } catch (_e) {}
}

// Helper: Click with ripple and tactile feedback
async function clickElement(page, targetSelector) {
  try {
    await smoothMove(page, targetSelector, 14);
    const el = await page.$(targetSelector);
    if (!el) return false;
    const box = await el.boundingBox();
    if (!box) return false;
    const x = Math.round(box.x + box.width / 2);
    const y = Math.round(box.y + box.height / 2);

    await page.evaluate(({ x, y }) => {
      const cur = document.getElementById('virtual-cursor');
      if (cur) {
        cur.style.transform = 'translate(-50%, -50%) scale(0.7)';
        setTimeout(() => {
          cur.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);
      }
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    }, { x, y });

    await page.click(targetSelector);
    return true;
  } catch (_e) {
    return false;
  }
}

// Helper: Smooth page scroll
async function smoothScroll(page, deltaY, durationMs = 1200) {
  const steps = 20;
  const stepDelta = deltaY / steps;
  const stepDelay = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy({ top: d, behavior: 'smooth' }), stepDelta);
    await wait(stepDelay);
  }
}

// Inject futuristic Director HUD and effects into DOM
async function injectModernDirectorEffects(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-director-styles')) return;

    const style = document.createElement('style');
    style.id = 'demo-director-styles';
    style.innerHTML = `
      @keyframes beamSweep {
        0% { top: -4%; opacity: 0; }
        15% { opacity: 0.95; }
        85% { opacity: 0.95; }
        100% { top: 104%; opacity: 0; }
      }
      @keyframes hudEntrance {
        0% { transform: translateY(-16px) scale(0.92); opacity: 0; }
        60% { transform: translateY(2px) scale(1.02); opacity: 1; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes rippleClick {
        0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; border-width: 3px; }
        100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; border-width: 1px; }
      }
      .director-beam {
        position: fixed;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.3) 15%, #38bdf8 45%, #34d399 65%, transparent 100%);
        box-shadow: 0 0 20px #38bdf8, 0 0 45px rgba(56,189,248,0.7);
        pointer-events: none;
        z-index: 99998;
        display: none;
      }
      .director-beam.active {
        display: block;
        animation: beamSweep 0.65s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }
      .director-flash {
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at center, rgba(56,189,248,0.12) 0%, transparent 75%);
        pointer-events: none;
        z-index: 99997;
        opacity: 0;
        transition: opacity 0.35s ease-out;
      }
      .director-flash.active {
        opacity: 1;
      }
      .virtual-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #0284c7;
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px rgba(14, 165, 233, 0.95), 0 2px 6px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: transform 0.05s ease-out;
      }
      .cursor-ripple {
        position: fixed;
        top: 0;
        left: 0;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #38bdf8;
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        animation: rippleClick 0.45s ease-out forwards;
      }
      .director-hud {
        position: fixed;
        top: 16px;
        right: 24px;
        z-index: 99990;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 14px;
        border-radius: 9999px;
        background: rgba(9, 9, 11, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(63, 63, 70, 0.7);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        animation: hudEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    const beam = document.createElement('div');
    beam.id = 'director-beam';
    beam.className = 'director-beam';
    document.body.appendChild(beam);

    const flash = document.createElement('div');
    flash.id = 'director-flash';
    flash.className = 'director-flash';
    document.body.appendChild(flash);

    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.className = 'virtual-cursor';
    cursor.style.left = '720px';
    cursor.style.top = '405px';
    document.body.appendChild(cursor);

    const hud = document.createElement('div');
    hud.id = 'director-hud';
    hud.className = 'director-hud';
    hud.innerHTML = `
      <div style="display: flex; align-items: center; gap: 7px;">
        <span style="position: relative; display: flex; height: 8px; width: 8px;">
          <span style="position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #34d399; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 8px; width: 8px; background-color: #10b981;"></span>
        </span>
        <span id="director-scene-tag" style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #d4d4d8; background: #27272a; padding: 2px 7px; border-radius: 4px; border: 1px solid #3f3f46;">ACT I</span>
      </div>
      <div style="height: 12px; width: 1px; background: #3f3f46;"></div>
      <span id="director-scene-title" style="font-size: 11px; font-weight: 600; color: #f4f4f5; letter-spacing: 0.02em;">Protocol Architecture & Problem</span>
    `;
    document.body.appendChild(hud);
  });
}

// Trigger high-tech scene transition with laser sweep beam & HUD refresh
async function triggerSceneTransition(page, act, title) {
  console.log(`\n🎬 [Transition] -> ${act}: ${title}`);
  await page.evaluate(({ act, title }) => {
    const beam = document.getElementById('director-beam');
    if (beam) {
      beam.classList.remove('active');
      void beam.offsetWidth;
      beam.classList.add('active');
      setTimeout(() => beam.classList.remove('active'), 650);
    }

    const flash = document.getElementById('director-flash');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 350);
    }

    const hud = document.getElementById('director-hud');
    const tag = document.getElementById('director-scene-tag');
    const titleEl = document.getElementById('director-scene-title');
    if (tag) tag.textContent = act;
    if (titleEl) titleEl.textContent = title;
    if (hud) {
      hud.style.animation = 'none';
      void hud.offsetWidth;
      hud.style.animation = 'hudEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }, { act, title });
}

async function run() {
  console.log('====================================================');
  console.log(' Sentinel402 Automated Playwright Demo Recorder');
  console.log('====================================================');

  console.log('[1/7] Launching Chromium browser (1440x810 YouTube 16:9)...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 810 }
    }
  });

  const page = await context.newPage();

  console.log('[2/7] Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('sentinel402_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  });
  await wait(1000);

  // Inject Director HUD & laser beam effects
  await injectModernDirectorEffects(page);
  await wait(1000);

  // Initialize synchronized master clock
  const recordingStartTime = Date.now();
  async function waitUntilTargetTime(targetSeconds) {
    const elapsed = (Date.now() - recordingStartTime) / 1000;
    const remainingMs = Math.round((targetSeconds - elapsed) * 1000);
    if (remainingMs > 0) {
      console.log(`  [Sync] Waiting ${(remainingMs / 1000).toFixed(2)}s for voiceover sync at ${targetSeconds}s...`);
      await wait(remainingMs);
    }
  }

  // -------------------------------------------------------------------------
  // SCENE 1: Introduction & The Core Problem (0:00 - 0:31.8, ~31.8s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT I', 'Autonomous Agent Dilemma & Architecture');
  console.log('[Scene 1] Narration: Intro & Core Problem...');

  // Hover over Header elements
  await smoothMove(page, 'header', 16);
  await wait(3000);

  // Hover over agent identity badge
  await smoothMove(page, 'header .font-mono', 14);
  await wait(4000);

  // Hover over Hero overview card
  await smoothMove(page, 'h2:has-text("Sentinel402 Gateway")', 16);
  await wait(6000);

  // Hover over network status indicators
  await smoothMove(page, 'div:has-text("Network Status")', 14);
  await wait(6000);

  await waitUntilTargetTime(31.8);

  // -------------------------------------------------------------------------
  // SCENE 2: The x402 Micropayment Paywall (0:31.8 - 1:01.6, ~29.8s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT II', 'RFC-Compliant x402 Micropayment Challenge');
  console.log('[Scene 2] Narration: x402 Paywall Challenge...');

  // Click "Simulate 402 Paywall"
  await clickElement(page, 'button:has-text("Simulate 402 Paywall")');
  await wait(1200);

  // Click "Run Bazantic Recipe"
  await clickElement(page, 'button:has-text("Run Bazantic Recipe")');
  console.log('  -> Triggered 402 challenge request');
  await wait(2000);

  // The 402 challenge modal pops up
  try {
    await page.waitForSelector('text=HTTP 402 Payment Required', { timeout: 4000 });
    console.log('  -> ChallengeModal visible');
    await smoothMove(page, 'text=0.001 ETH', 16);
    await wait(4500);
    await smoothMove(page, 'text=0x4020000000000000000000000000000000000001', 16);
    await wait(5000);

    // Click button to authenticate and close modal
    await clickElement(page, 'button:has-text("Pass Bazantic MPP Bearer Token")');
    console.log('  -> Authenticated via modal');
  } catch (_e) {
    console.log('  -> Modal handled or skipped');
  }
  await wait(3000);

  await waitUntilTargetTime(61.6);

  // -------------------------------------------------------------------------
  // SCENE 3: Unlocking, Subgraph Indexing & Deterministic Digest (1:01.6 - 1:40.2, ~38.6s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT III', 'Decentralized Subgraph Indexing & Keccak256 Hash');
  console.log('[Scene 3] Narration: Subgraph Studio & Keccak256 Digest...');

  // Ensure "Authorized (MPP Token)" is selected
  await clickElement(page, 'button:has-text("Authorized (MPP Token)")');
  await wait(1000);

  // Click "Run Bazantic Recipe" to execute authorized flow
  await clickElement(page, 'button:has-text("Run Bazantic Recipe")');
  console.log('  -> Executing full authorized audit pipeline');
  await wait(3500);

  // Smooth scroll down to Pools Table
  await smoothScroll(page, 420, 1200);
  await wait(1000);

  // Hover over live indexer status badge
  await smoothMove(page, 'span:has-text("Uniswap v3 Studio (Live Mainnet)")', 14);
  await wait(2500);

  // Click on the first pool row to expand the new Pool Analytics Drawer
  console.log('  -> Expanding pool analytics drawer (token contracts, verified depth)');
  await smoothMove(page, 'table tbody tr:first-child', 14);
  await wait(1200);
  await clickElement(page, 'table tbody tr:first-child');
  await wait(1200);

  // Inspect Token 0 & Subgraph on-chain depth
  await smoothMove(page, 'div:has-text("Token 0 Contract")', 14);
  await wait(2500);
  await smoothMove(page, 'div:has-text("Subgraph On-Chain Depth")', 14);
  await wait(2500);

  // Smooth scroll back up to inspect Audit Summary & computed reportHash
  await smoothScroll(page, -420, 1200);
  await wait(1200);

  // Click "Payload" button to reveal the canonical JSON structure hashed with keccak256
  console.log('  -> Expanding Canonical Keccak-256 Payload Preview');
  await smoothMove(page, 'button:has-text("Payload")', 14);
  await wait(800);
  await clickElement(page, 'button:has-text("Payload")');
  await wait(1500);

  // Hover over the deterministic report hash and canonical JSON
  await smoothMove(page, 'span:has-text("keccak256 Deterministic Report Hash")', 14);
  await wait(2500);
  await smoothMove(page, 'div:has-text("Canonical Payload hashed with keccak256()")', 14);
  await wait(2500);

  await waitUntilTargetTime(100.2);

  // -------------------------------------------------------------------------
  // SCENE 4: ENSv2 Permissioned Resolver Attestation (1:40.2 - 2:07.0, ~26.8s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT IV', 'ENSv2 Permissioned Resolver Attestation');
  console.log('[Scene 4] Narration: ENSv2 Permissioned Resolver...');

  // Scroll down to EAC Inspector
  await smoothScroll(page, 280, 1000);
  await wait(1200);

  // Click to expand EAC Inspector accordion
  const eacButton = await page.$('button:has-text("ENSv2 Execution Access Control")');
  if (eacButton) {
    await clickElement(page, 'button:has-text("ENSv2 Execution Access Control")');
    console.log('  -> Expanded ENSv2 EAC Inspector accordion');
  }
  await wait(2000);

  // Hover over the subname and setText details
  await smoothMove(page, 'code:has-text("records[\'last_audit_hash\']")', 14);
  await wait(2500);
  await smoothMove(page, 'span:has-text("setText(bytes32 node")', 14);
  await wait(2500);

  // Click "Verify On-Chain Resolver" button to ping Sepolia live!
  console.log('  -> Clicking Verify On-Chain Resolver button');
  await clickElement(page, 'button:has-text("Verify On-Chain Resolver")');
  await wait(2500);

  // Inspect the live verified resolver card
  await smoothMove(page, 'span:has-text("Live Resolver Record Matched")', 14);
  await wait(3000);
  await smoothMove(page, 'span:has-text("Attested Hash")', 14);
  await wait(3000);

  await waitUntilTargetTime(126.9);

  // -------------------------------------------------------------------------
  // SCENE 5: Model Context Protocol (MCP) & Demo Studio (2:07.0 - 2:35.4, ~28.5s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT V', 'Model Context Protocol (MCP) & Studio');
  console.log('[Scene 5] Narration: MCP Tools & Demo Studio...');

  // Scroll down to MCP Console
  await smoothScroll(page, 520, 1200);
  await wait(1200);

  // Hover over MCP header
  await smoothMove(page, 'h3:has-text("Model Context Protocol")', 14);
  await wait(1500);

  // Expand Claude / Cursor config snippet
  console.log('  -> Toggling Claude / Cursor Config');
  await clickElement(page, 'button:has-text("Claude / Cursor Config")');
  await wait(2500);
  await clickElement(page, 'button:has-text("Claude / Cursor Config")');
  await wait(1000);

  // Switch active tool to get_ens_attestation
  console.log('  -> Selecting get_ens_attestation tool');
  await clickElement(page, 'button:has-text("get_ens_attestation")');
  await wait(1500);

  // Simulate live MCP JSON-RPC tool call
  console.log('  -> Simulating Claude tool call on /api/mcp');
  await clickElement(page, 'button:has-text("Simulate Claude / Agent Tool Call")');
  await wait(2500);

  // Hover over the resulting JSON-RPC panels
  await smoothMove(page, 'span:has-text("JSON-RPC 2.0 Call Succeeded")', 14);
  await wait(2500);
  await smoothMove(page, 'span:has-text("Sentinel402 MCP Result")', 14);
  await wait(2500);

  // Click "Export Signed Run" button
  console.log('  -> Clicking Export Signed Run');
  const exportBtn = await page.$('button:has-text("Export Signed Run")');
  if (exportBtn) {
    await clickElement(page, 'button:has-text("Export Signed Run")');
  }
  await wait(2000);

  await waitUntilTargetTime(155.4);

  // -------------------------------------------------------------------------
  // SCENE 6: Conclusion (2:35.4 - 2:54.3, ~18.9s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT VI', 'Verified Trust Layer for Autonomous DeFi');
  console.log('[Scene 6] Narration: Conclusion & GitHub Repository...');

  // Scroll down to Footer
  await smoothScroll(page, 320, 1000);
  await wait(1200);

  // Hover over sponsor badges
  await smoothMove(page, 'span:has-text("The Graph Studio")', 14);
  await wait(2500);
  await smoothMove(page, 'span:has-text("Bazantic x402")', 14);
  await wait(2500);
  await smoothMove(page, 'span:has-text("ENSv2 Sepolia")', 14);
  await wait(2500);

  // Hover over GitHub repository link
  await smoothMove(page, 'a:has-text("github.com/nlnw/eth-online-2026")', 14);
  await wait(3000);

  // Smooth cinematic glide back up to top overview
  await smoothScroll(page, -800, 1600);
  await wait(2000);

  await waitUntilTargetTime(174.5);

  console.log('[6/7] Finalizing video stream and closing browser...');
  await page.close();
  await context.close();
  await browser.close();

  // Find the generated video file
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (videoFiles.length === 0) {
    throw new Error('No recorded video file found in ' + VIDEO_DIR);
  }

  // Pick the newest file
  const newestVideo = videoFiles
    .map((f) => ({ name: f, time: fs.statSync(path.join(VIDEO_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time)[0].name;

  const rawVideoPath = path.join(VIDEO_DIR, newestVideo);
  const targetVideoPath = path.join(ROOT_DIR, 'recordings', 'sentinel402_screen_demo.webm');

  fs.copyFileSync(rawVideoPath, targetVideoPath);
  console.log(`[7/7] Raw screen capture saved to: ${targetVideoPath}`);

  // Automatically mux if voiceover audio exists
  const audioPath = path.join(ROOT_DIR, 'recordings', 'demo_voiceover.mp3');
  const finalOutputPath = path.join(ROOT_DIR, 'recordings', 'sentinel402_demo_submission.mp4');

  if (fs.existsSync(audioPath)) {
    console.log('====================================================');
    console.log(' Starting Automated Audio/Video Muxing with FFmpeg');
    console.log('====================================================');
    execSync(`bash "${path.join(ROOT_DIR, 'scripts', 'mux_video.sh')}" "${targetVideoPath}" "${audioPath}" "${finalOutputPath}"`, {
      stdio: 'inherit'
    });

    // Clean up internal playwright video temp directory, but KEEP sentinel402_screen_demo.webm for fast remuxing!
    if (fs.existsSync(VIDEO_DIR)) {
      fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
    }
    console.log(`[Cache] Preserved raw webm screen capture at: ${targetVideoPath}`);

    console.log(`\n🎉 SUBMISSION VIDEO READY: ${finalOutputPath}`);
  } else {
    console.log('\n[Notice] Audio file not found. Run `npm run voiceover` then `npm run mux` to assemble.');
  }
}

run().catch((err) => {
  console.error('[Error during automated recording]:', err);
  process.exit(1);
});
