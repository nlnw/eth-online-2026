# Bazantic x402 Gateway & Recipe Specification

This directory contains the declarative **Bazantic Recipe** configuration and schema definition for GraphAgent Gateway.

## How Bazantic Works in GraphAgent Gateway

1. **x402 / MPP Micropayment Gateway:**
   - Every API request targeting the agent's computation pipeline (`POST /api/run-audit`) passes through the Bazantic Gateway filter.
   - If an incoming request lacks valid credentials, the gateway halts execution and immediately issues an RFC-compliant `HTTP 402 Payment Required` challenge.
   - The challenge provides complete payment metadata:
     - Scheme: `x402`
     - Realm: `bazantic-mpp-gateway`
     - Price: `0.001 ETH`
     - Facilitator Contract: `0x4020000000000000000000000000000000000001`
     - Nonce & Pricing tier

2. **Declarative Recipe Execution (`recipe.json`):**
   - Bazantic Recipes orchestrate multi-step autonomous agent operations:
     - **Step 1 (`ingest_gateway_credentials`)**: Ingests and authenticates the Bazantic Bearer token (`Bearer bazantic_mpp_...`).
     - **Step 2 (`fetch_subgraph_liquidity`)**: Dispatches GraphQL queries to The Graph Subgraph Studio for Uniswap v3 pool volumes and TVL, then computes a deterministic `keccak256` audit report hash.
     - **Step 3 (`ensv2_attestation_write`)**: Writes the audit hash to the ENSv2 Permissioned Resolver on Ethereum Sepolia for subname `oracle.agentcorp.eth`.

3. **Recipe Validation:**
   - After the steps complete, the verification policy validates that the on-chain resolver record `records['last_audit_hash']` matches the deterministic report hash generated in Step 2.
