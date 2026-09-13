#!/usr/bin/env python3
"""
Sentinel402 Gateway - Voiceover Generator
Uses Microsoft Edge Neural TTS (edge-tts) via uv to produce studio-grade demo audio and subtitles.
"""

import asyncio
import os
import sys
from pathlib import Path

# Script text phonetically optimized for natural speech synthesis
NARRATION_SECTIONS = [
    (
        "Scene 1: Introduction & Problem",
        "As autonomous A-I agents take over on-chain trading and data pipelines, they run into two missing primitives. "
        "First: how do they pay for specialized micro-services without centralized credit cards or custodial API accounts? "
        "And second: how do downstream contracts verify that an agent's audit was actually computed against canonical on-chain state? "
        "This is Sentinel four-oh-two Gateway. An autonomous liquidity auditor powered by the x-four-oh-two Micropayment Protocol, "
        "The Graph Subgraph Studio, and E-N-S v-two permissioned attestations."
    ),
    (
        "Scene 2: The x402 Micropayment Paywall",
        "Let's see what happens when an unauthorized agent requests an on-demand audit. "
        "When we trigger the endpoint without payment, the gateway immediately intercepts the call and returns an R-F-C compliant "
        "H-T-T-P four-oh-two Payment Required challenge. "
        "Notice the response: it specifies the exact micropayment required — point zero zero one E-T-H — along with the Bazantic facilitator address. "
        "No credit cards, no pre-shared secrets. Any autonomous agent can parse this header and settle payment programmatically."
    ),
    (
        "Scene 3: Unlocking & Subgraph Indexing",
        "Now, we pass a valid Bazantic M-P-P session token and re-execute. "
        "The gateway verifies the credential against the facilitator and dispatches Step Two of our declarative Bazantic recipe. "
        "Here, Sentinel four-oh-two queries The Graph Subgraph Studio for live mainnet Uniswap v-three pool data. "
        "In real time, it indexes total value locked, fee tiers, and volume velocity, calculating a comprehensive liquidity risk score. "
        "Most importantly, the agent serializes this state into a canonical payload and computes a deterministic Keccak two-fifty-six report hash, "
        "creating a tamper-proof cryptographic fingerprint of the audited liquidity."
    ),
    (
        "Scene 4: ENSv2 Permissioned Resolver Attestation",
        "In Step Three, we lock this audit permanently on-chain. "
        "Using E-N-S v-two on Ethereum Sepolia, the agent connects to the official Permissioned Resolver and calls set text, "
        "binding the audit hash directly to the subname auditor dot sentinel four-oh-two dot eth, under the key records last audit hash. "
        "Any De-Fi protocol or smart contract can now inspect this E-N-S record to verify that liquidity depth was independently validated "
        "before routing high-value transactions."
    ),
    (
        "Scene 5: Model Context Protocol & Demo Studio",
        "For A-I agent developers, Sentinel four-oh-two exposes this entire lifecycle over the Model Context Protocol. "
        "Tools like Claude Desktop, Cursor, or autonomous agent frameworks can call audit pool liquidity or get E-N-S attestation natively via standard I-O or H-T-T-P JSON-R-P-C. "
        "We've also built an interactive Demo Studio right into the frontend, letting judges replay every stage, inspect raw payloads, and export signed audit runs."
    ),
    (
        "Scene 6: Conclusion",
        "Sentinel four-oh-two Gateway brings together machine-payable A-P-Is, real-time decentralized indexing, and verifiable on-chain identity, "
        "building the trust layer for the next generation of autonomous on-chain agents. "
        "Thank you, and check out the open-source code on GitHub at n-l-n-w slash eth-online-twenty-twenty-six."
    )
]

async def generate_audio():
    import edge_tts

    voice = os.getenv("TTS_VOICE", "en-US-ChristopherNeural")
    output_dir = Path(__file__).resolve().parent.parent / "recordings"
    output_dir.mkdir(parents=True, exist_ok=True)

    mp3_path = output_dir / "demo_voiceover.mp3"
    vtt_path = output_dir / "demo_voiceover.vtt"

    full_text = "\n\n".join(text for _, text in NARRATION_SECTIONS)
    print(f"[TTS] Generating voiceover using voice: {voice}")
    print(f"[TTS] Destination: {mp3_path}")

    # Generate audio and subtitles in single stream
    communicate = edge_tts.Communicate(full_text, voice, rate="+2%", volume="+0%")
    sub_maker = edge_tts.SubMaker()
    with open(str(mp3_path), "wb") as file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                file.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub_maker.feed(chunk)

    with open(str(vtt_path), "w", encoding="utf-8") as f:
        f.write(sub_maker.get_srt())

    print(f"[TTS] Successfully generated:")
    print(f"  - Audio: {mp3_path} ({mp3_path.stat().st_size / 1024:.1f} KB)")
    print(f"  - Subtitles: {vtt_path}")

if __name__ == "__main__":
    asyncio.run(generate_audio())
