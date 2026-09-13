#!/usr/bin/env node

/**
 * Sentinel402 Gateway - Automated Playwright Screen Demo Recorder
 * 
 * Automatically controls Chromium at 1920x1080, executing the exact visual actions
 * synchronized with recordings/demo_voiceover.mp3 (approx 3m 07s total).
 * 
 * Produces:
 *   1. recordings/sentinel402_screen_demo.webm (Clean 1080p browser capture)
 *   2. Automatically calls scripts/mux_video.sh to produce recordings/sentinel402_demo_submission.mp4
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

// Helper: Sleep
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Smooth mouse move
async function smoothMove(page, targetSelector, steps = 15) {
  try {
    const el = await page.$(targetSelector);
    if (!el) return;
    const box = await el.boundingBox();
    if (!box) return;

    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;

    await page.mouse.move(targetX, targetY, { steps });
    await wait(300);
  } catch (_e) {}
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

async function run() {
  console.log('====================================================');
  console.log(' Sentinel402 Automated Playwright Demo Recorder');
  console.log('====================================================');

  console.log('[1/7] Launching Chromium browser (1920x1080)...');
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
  await wait(2000);

  // -------------------------------------------------------------------------
  // SCENE 1: Introduction & The Core Problem (0:00 - 0:25, ~25s)
  // -------------------------------------------------------------------------
  console.log('[Scene 1] Narration: Intro & Core Problem...');
  // Hover over HeaderBadge elements
  await smoothMove(page, 'header');
  await wait(3000);

  // Hover over agent identity badge
  await smoothMove(page, 'header .font-mono');
  await wait(4000);

  // Hover over Hero overview card
  await smoothMove(page, 'h2:has-text("Sentinel402 Gateway")');
  await wait(5000);

  // Hover over network status indicators
  await smoothMove(page, 'div:has-text("Network Status")');
  await wait(6000);

  // -------------------------------------------------------------------------
  // SCENE 2: The x402 Micropayment Paywall (0:25 - 0:55, ~30s)
  // -------------------------------------------------------------------------
  console.log('[Scene 2] Narration: x402 Paywall Challenge...');
  // Click "Simulate 402 Paywall"
  await smoothMove(page, 'button:has-text("Simulate 402 Paywall")');
  await page.click('button:has-text("Simulate 402 Paywall")');
  await wait(1500);

  // Click "Run Bazantic Recipe"
  await smoothMove(page, 'button:has-text("Run Bazantic Recipe")');
  await page.click('button:has-text("Run Bazantic Recipe")');
  console.log('  -> Triggered 402 challenge request');
  await wait(3000);

  // The 402 challenge modal should pop up!
  // Hover over the HTTP 402 details inside modal
  try {
    await page.waitForSelector('text=HTTP 402 Payment Required', { timeout: 4000 });
    console.log('  -> ChallengeModal visible');
    await smoothMove(page, 'text=0.001 ETH');
    await wait(4000);
    await smoothMove(page, 'text=0x4020000000000000000000000000000000000001');
    await wait(6000);

    // Hover over the modal trigger button
    await smoothMove(page, 'button:has-text("Pass Bazantic MPP Bearer Token")');
    await wait(4000);
    // Click button to authenticate and close modal
    await page.click('button:has-text("Pass Bazantic MPP Bearer Token")');
    console.log('  -> Authenticated via modal');
  } catch (_e) {
    console.log('  -> Modal dismissed or handled via toolbar');
  }
  await wait(5000);

  // -------------------------------------------------------------------------
  // SCENE 3: Unlocking, Subgraph Indexing & Deterministic Digest (0:55 - 1:35, ~40s)
  // -------------------------------------------------------------------------
  console.log('[Scene 3] Narration: Subgraph Studio & Keccak256 Digest...');
  // Ensure "Authorized (MPP Token)" is selected
  await smoothMove(page, 'button:has-text("Authorized (MPP Token)")');
  await page.click('button:has-text("Authorized (MPP Token)")');
  await wait(1500);

  // Click "Run Bazantic Recipe"
  await smoothMove(page, 'button:has-text("Run Bazantic Recipe")');
  await page.click('button:has-text("Run Bazantic Recipe")');
  console.log('  -> Executing full authorized audit pipeline');
  await wait(4000);

  // Smooth scroll down to Pools Table
  await smoothScroll(page, 350, 1500);
  await wait(4000);

  // Hover over pool rows
  await smoothMove(page, 'table tbody tr:first-child');
  await wait(4000);
  await smoothMove(page, 'table tbody tr:nth-child(2)');
  await wait(4000);

  // Smooth scroll back up to inspect the computed reportHash
  await smoothScroll(page, -350, 1200);
  await wait(2000);
  await smoothMove(page, 'div:has-text("Deterministic Keccak256 Digest")');
  await wait(12000);

  // -------------------------------------------------------------------------
  // SCENE 4: ENSv2 Permissioned Resolver Attestation (1:35 - 2:05, ~30s)
  // -------------------------------------------------------------------------
  console.log('[Scene 4] Narration: ENSv2 Permissioned Resolver...');
  // Scroll down to EAC Inspector
  await smoothScroll(page, 200, 1000);
  await wait(2000);

  // Click to expand EAC Inspector
  const eacButton = await page.$('button:has-text("ENSv2 Execution Access Control")');
  if (eacButton) {
    await smoothMove(page, 'button:has-text("ENSv2 Execution Access Control")');
    await eacButton.click();
    console.log('  -> Expanded ENSv2 EAC Inspector accordion');
  }
  await wait(4000);

  // Hover over the subname and setText details
  await smoothMove(page, 'text=auditor.sentinel402.eth');
  await wait(5000);
  await smoothMove(page, 'text=records[\'last_audit_hash\']');
  await wait(7000);

  // -------------------------------------------------------------------------
  // SCENE 5: Model Context Protocol (MCP) & Demo Studio (2:05 - 2:35, ~30s)
  // -------------------------------------------------------------------------
  console.log('[Scene 5] Narration: MCP Tools & Demo Studio...');
  // Scroll back to top
  await smoothScroll(page, -300, 1000);
  await wait(2000);

  // Click segmented "Light" mode button!
  console.log('  -> Switching to Light Mode');
  await smoothMove(page, 'header button:has-text("Light")');
  await page.click('header button:has-text("Light")');
  await wait(5000);

  // Show Light Mode aesthetic
  await smoothScroll(page, 200, 1000);
  await wait(3000);
  await smoothScroll(page, -200, 1000);
  await wait(2000);

  // Switch back to Dark Mode
  console.log('  -> Switching back to Dark Mode');
  await smoothMove(page, 'header button:has-text("Dark")');
  await page.click('header button:has-text("Dark")');
  await wait(4000);

  // Click "Recipe Spec" button in header to show Bazantic Recipe
  const recipeBtn = await page.$('header button:has-text("Recipe Spec")');
  if (recipeBtn) {
    await smoothMove(page, 'header button:has-text("Recipe Spec")');
    await recipeBtn.click();
    console.log('  -> Opened Recipe Spec Modal');
    await wait(4000);
    // Close modal
    const closeBtn = await page.$('div[role="dialog"] button:has-text("Close")');
    if (closeBtn) await closeBtn.click();
    else await page.keyboard.press('Escape');
  }
  await wait(3000);

  // -------------------------------------------------------------------------
  // SCENE 6: Conclusion (2:35 - 3:07, ~32s)
  // -------------------------------------------------------------------------
  console.log('[Scene 6] Narration: Conclusion & GitHub Repository...');
  // Smoothly hover across the entire interface
  await smoothMove(page, 'h2:has-text("Sentinel402 Gateway")');
  await wait(4000);
  await smoothScroll(page, 250, 1500);
  await wait(4000);
  await smoothScroll(page, -250, 1200);
  await wait(8000);

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
