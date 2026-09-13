# Sentinel402 Gateway — 3-Minute Demo Presentation Script

> **Target Hackathon:** ETHOnline 2026  
> **Target Bounty Tracks:**  
> 1. Bazantic: Best Recipe using Sponsor APIs (x402/MPP Gateway & Recipe integration)  
> 2. The Graph: Best AI Tooling / AI Use Case (Live Subgraph Studio integration)  
> 3. ENS: Best Use of ENSv2 (ENSv2 Sepolia Permissioned Resolver & EAC scoped attestation)

---

## 🎬 How to Record Directly in the Web UI

1. Open [`http://localhost:5173`](http://localhost:5173) in Chrome / Brave / Edge.
2. In the **Demo Studio** toolbar, click **Record Video (.webm)**.
3. Select this browser tab to capture full 1080p/720p 30fps video.
4. Follow the verbal script below while clicking the corresponding buttons in the UI.
5. Click **Stop Recording** — your video file will immediately download to your computer as `sentinel402_demo_recording_<timestamp>.webm`.

---

## 🎙️ Spoken Demo Script & Click-Through Guide

### Stage 1: Introduction & The Core Problem (0:00 – 0:35)

**[Screen: Show the Sentinel402 Gateway dashboard at `http://localhost:5173` in Dark Mode]**

> *"Hi everyone, welcome to our ETHOnline 2026 project: **Sentinel402 Gateway**.*
> 
> *As autonomous AI agents begin managing on-chain capital, they face two critical bottlenecks:*
> 1. *They need real-time, tamper-proof liquidity and risk data.*
> 2. *They need a native way to pay for compute and indexing APIs without centralized credit cards or API keys.*
> 
> *Sentinel402 Gateway solves this by unifying three Web3 pillars:*
> - *The **Bazantic x402 Micropayment Protocol** for autonomous agent paywalls.*
> - ***The Graph Subgraph Studio** for live DEX liquidity indexing and deterministic cryptographic audits.*
> - *And **ENSv2 on Ethereum Sepolia** for EAC-permissioned on-chain attestation.*
> 
> *Notice our agent identity in the top bar: `auditor.sentinel402.eth`, resolving through our ENSv2 Permissioned Resolver on Sepolia."*

---

### Stage 2: Bazantic x402 Gateway Interception (0:35 – 1:15)

**[Action: In the Gateway Auth toggle, click "Simulate 402 Paywall", then click "Run Bazantic Recipe"]**

> *"Let's test what happens when an unauthorized agent attempts to request an audit.*
> 
> *We trigger our pipeline without credentials. Notice the real-time console log:  
> Stage 1 initiates the handshake, but Stage 2 immediately halts execution.*
> 
> *The Bazantic Gateway issues an RFC-compliant `HTTP 402 Payment Required` challenge.*
> 
> *Let's look at the challenge payload in the inspector:*
> - *Scheme: `x402`*
> - *Facilitator contract: `0x4020000000000000000000000000000000000001`*
> - *Price: `0.001 ETH`*
> - *Header required: `Authorization: Bearer bazantic_mpp_<token>`*
> 
> *The unauthenticated request is blocked before any indexing compute or gas is wasted."*

---

### Stage 3: Payment Settlement & The Graph Subgraph Studio Indexing (1:15 – 1:55)

**[Action: Click "Pass Bazantic MPP Bearer Token" in the modal, or click "Authorized (MPP Token)" and "Run Bazantic Recipe"]**

> *"Now, the agent presents a valid Bazantic Micropayment session token.  
> The gateway validates the facilitator signature and immediately unlocks the pipeline.*
> 
> *In Stage 3, the agent dispatches a live GraphQL query to **The Graph Subgraph Studio**, fetching the deepest Uniswap v3 liquidity pools on Ethereum Mainnet.*
> 
> *Look at the audited pools table below:*
> - *We indexed USDC/WETH with $284M in TVL and $184M in 24-hour volume.*
> - *WBTC/WETH with $192M in TVL.*
> - *USDT/WETH with $148M in TVL.*
> 
> *Our audit engine models liquidity depth, volume velocity, and fee tier concentration, calculating a health score of 98.5 out of 100.*
> 
> *Crucially, we serialize this normalized audit state and compute a deterministic `keccak256` hash: `0x5714ee2c...` representing the verified DEX state at this block."*

---

### Stage 4: ENSv2 Sepolia Permissioned Resolver Attestation (1:55 – 2:30)

**[Action: Scroll to the On-Chain Cryptographic Attestation card showing the reportHash and Sepolia txHash]**

> *"Now that the audit hash is computed, the agent needs to record it immutably for the entire ecosystem.*
> 
> *In Stage 4, our backend uses `viem` to interact with an **ENSv2 Permissioned Resolver** on Ethereum Sepolia.*
> 
> *Under ENSv2's Execution Access Control (EAC), the agent proves authorization for subname `auditor.sentinel402.eth` and executes a `setText` transaction writing `records['last_audit_hash']`.*
> 
> *Here is the resulting Sepolia transaction hash. Anyone on Sepolia can query our resolver contract to verify that the agent's published data matches the on-chain attestation."*

---

### Stage 5: Verification & Wrap-Up (2:30 – 3:00)

**[Action: Toggle Light/Dark mode in top right to show crisp design, then click "Export Run JSON"]**

> *"Notice how the interface adapts seamlessly between dark and light developer modes with zero AI fluff or loud gradients.*
> 
> *We can also click **Export Run JSON** to download the complete signed audit recording, capturing request headers, challenge parameters, pool metrics, and transaction receipts.*
> 
> *In summary:  
> - **Bazantic** provides trustless monetization via x402 micropayments.  
> - **The Graph** provides decentralized, verifiable data indexing.  
> - And **ENSv2** provides sovereign agent identity and immutable state attestation.*
> 
> *Thank you, and we look forward to your questions!"*

---

## 🛠️ CLI Automated Run Alternative

If presenting from a terminal or headless environment:
```bash
# Run the automated 5-stage flow & generate both JSON and asciinema recording:
npm run record

# Replay the recorded terminal run:
npm run play
```
