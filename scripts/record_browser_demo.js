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

  // -------------------------------------------------------------------------
  // SCENE 1: Introduction & The Core Problem (0:00 - 0:31, ~31s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT I', 'Autonomous Agent Dilemma & Architecture');
  console.log('[Scene 1] Narration: Intro & Core Problem...');

  // Hover over HeaderBadge elements
  await smoothMove(page, 'header');
  await wait(4000);

  // Hover over agent identity badge
  await smoothMove(page, 'header .font-mono');
  await wait(5000);

  // Hover over Hero overview card
  await smoothMove(page, 'h2:has-text("Sentinel402 Gateway")');
  await wait(7000);

  // Hover over network status indicators
  await smoothMove(page, 'div:has-text("Network Status")');
  await wait(8000);

  // -------------------------------------------------------------------------
  // SCENE 2: The x402 Micropayment Paywall (0:31 - 1:01, ~30s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT II', 'RFC-Compliant x402 Micropayment Challenge');
  console.log('[Scene 2] Narration: x402 Paywall Challenge...');

  // Click "Simulate 402 Paywall"
  await clickElement(page, 'button:has-text("Simulate 402 Paywall")');
  await wait(1500);

  // Click "Run Bazantic Recipe"
  await clickElement(page, 'button:has-text("Run Bazantic Recipe")');
  console.log('  -> Triggered 402 challenge request');
  await wait(2500);

  // The 402 challenge modal should pop up!
  try {
    await page.waitForSelector('text=HTTP 402 Payment Required', { timeout: 4000 });
    console.log('  -> ChallengeModal visible');
    await smoothMove(page, 'text=0.001 ETH');
    await wait(5000);
    await smoothMove(page, 'text=0x4020000000000000000000000000000000000001');
    await wait(6000);

    // Click button to authenticate and close modal
    await clickElement(page, 'button:has-text("Pass Bazantic MPP Bearer Token")');
    console.log('  -> Authenticated via modal');
  } catch (_e) {
    console.log('  -> Modal handled or skipped');
  }
  await wait(4000);

  // -------------------------------------------------------------------------
  // SCENE 3: Unlocking, Subgraph Indexing & Deterministic Digest (1:01 - 1:40, ~39s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT III', 'Decentralized Subgraph Indexing & Keccak256 Hash');
  console.log('[Scene 3] Narration: Subgraph Studio & Keccak256 Digest...');

  // Ensure "Authorized (MPP Token)" is selected
  await clickElement(page, 'button:has-text("Authorized (MPP Token)")');
  await wait(1500);

  // Click "Run Bazantic Recipe"
  await clickElement(page, 'button:has-text("Run Bazantic Recipe")');
  console.log('  -> Executing full authorized audit pipeline');
  await wait(4000);

  // Smooth scroll down to Pools Table
  await smoothScroll(page, 350, 1500);
  await wait(5000);

  // Hover over pool rows
  await smoothMove(page, 'table tbody tr:first-child');
  await wait(5000);
  await smoothMove(page, 'table tbody tr:nth-child(2)');
  await wait(5000);

  // Smooth scroll back up to inspect the computed reportHash
  await smoothScroll(page, -350, 1200);
  await wait(2000);
  await smoothMove(page, 'div:has-text("Deterministic Keccak256 Digest")');
  await wait(13000);

  // -------------------------------------------------------------------------
  // SCENE 4: ENSv2 Permissioned Resolver Attestation (1:40 - 2:07, ~27s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT IV', 'ENSv2 Permissioned Resolver Attestation');
  console.log('[Scene 4] Narration: ENSv2 Permissioned Resolver...');

  // Scroll down to EAC Inspector
  await smoothScroll(page, 220, 1000);
  await wait(2000);

  // Click to expand EAC Inspector
  const eacButton = await page.$('button:has-text("ENSv2 Execution Access Control")');
  if (eacButton) {
    await clickElement(page, 'button:has-text("ENSv2 Execution Access Control")');
    console.log('  -> Expanded ENSv2 EAC Inspector accordion');
  }
  await wait(4000);

  // Hover over the subname and setText details
  await smoothMove(page, 'text=auditor.sentinel402.eth');
  await wait(6000);
  await smoothMove(page, 'text=records[\'last_audit_hash\']');
  await wait(9000);

  // -------------------------------------------------------------------------
  // SCENE 5: Model Context Protocol (MCP) & Demo Studio (2:07 - 2:35, ~28s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT V', 'Model Context Protocol (MCP) & Studio');
  console.log('[Scene 5] Narration: MCP Tools & Demo Studio...');

  // Scroll back to top
  await smoothScroll(page, -250, 1000);
  await wait(2000);

  // Click "Recipe Spec" button in header to show Bazantic Recipe
  const recipeBtn = await page.$('header button:has-text("Recipe Spec")');
  if (recipeBtn) {
    await clickElement(page, 'header button:has-text("Recipe Spec")');
    console.log('  -> Opened Recipe Spec Modal');
    await wait(5000);

    // Close modal cleanly via data-testid or footer button
    const closeBtn = await page.$('[data-testid="modal-close-btn"]') || await page.$('[data-testid="modal-close-footer-btn"]');
    if (closeBtn) {
      await clickElement(page, '[data-testid="modal-close-btn"]');
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForSelector('div[role="dialog"]', { state: 'detached', timeout: 3000 }).catch(() => {});
    console.log('  -> Closed Recipe Spec Modal');
  }
  await wait(2000);

  // Click segmented "Light" mode button!
  console.log('  -> Switching to Light Mode');
  await clickElement(page, 'header button:has-text("Light")');
  await wait(4000);

  // Show Light Mode aesthetic
  await smoothScroll(page, 180, 1000);
  await wait(3000);
  await smoothScroll(page, -180, 1000);
  await wait(2000);

  // Switch back to Dark Mode
  console.log('  -> Switching back to Dark Mode');
  await clickElement(page, 'header button:has-text("Dark")');
  await wait(3000);

  // -------------------------------------------------------------------------
  // SCENE 6: Conclusion (2:35 - 2:54, ~19s)
  // -------------------------------------------------------------------------
  await triggerSceneTransition(page, 'ACT VI', 'Verified Trust Layer for Autonomous DeFi');
  console.log('[Scene 6] Narration: Conclusion & GitHub Repository...');

  // Smoothly hover across the entire interface
  await smoothMove(page, 'h2:has-text("Sentinel402 Gateway")');
  await wait(5000);
  await smoothScroll(page, 200, 1200);
  await wait(5000);
  await smoothScroll(page, -200, 1000);
  await wait(7000);

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

    // Clean up intermediate raw webm video files and temporary directory
    if (fs.existsSync(VIDEO_DIR)) {
      fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(targetVideoPath)) {
      fs.unlinkSync(targetVideoPath);
    }
    console.log('[Cleanup] Removed raw intermediate webm video captures.');

    console.log(`\n🎉 SUBMISSION VIDEO READY: ${finalOutputPath}`);
  } else {
    console.log('\n[Notice] Audio file not found. Run `npm run voiceover` then `npm run mux` to assemble.');
  }
}

run().catch((err) => {
  console.error('[Error during automated recording]:', err);
  process.exit(1);
});
