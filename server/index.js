import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { fetchSubgraphLiquidity } from './src/graph.js';
import { writeAuditAttestation, readAuditAttestation, getAgentWalletStatus } from './src/ens.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const AGENT_SUBNAME = process.env.ENS_AGENT_SUBNAME || 'auditor.sentinel402.eth';
const FACILITATOR_ADDRESS = process.env.X402_FACILITATOR_ADDRESS || '0x4020000000000000000000000000000000000001';
const RESOLVER_ADDRESS = process.env.ENS_RESOLVER_ADDRESS || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health & Gateway Identity Status
 */
app.get('/api/health', async (req, res) => {
  const wallet = await getAgentWalletStatus();
  res.json({
    status: 'online',
    service: 'Sentinel402 Gateway',
    version: '1.0.0',
    agentName: AGENT_SUBNAME,
    subname: AGENT_SUBNAME,
    agentAddress: wallet.address || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
    wallet,
    network: 'Ethereum Sepolia (Chain ID: 11155111)',
    resolverAddress: RESOLVER_ADDRESS,
    bazanticFacilitator: FACILITATOR_ADDRESS,
    faucets: [
      'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
      'https://www.alchemy.com/faucets/ethereum-sepolia',
      'https://sepolia-faucet.pk910.de/'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * Get Bazantic Recipe Specification
 */
app.get('/api/recipe', (req, res) => {
  try {
    const recipePath = join(__dirname, '..', 'bazantic', 'recipe.json');
    const recipeData = JSON.parse(readFileSync(recipePath, 'utf8'));
    res.json(recipeData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load Bazantic recipe', details: err.message });
  }
});

/**
 * Read current ENSv2 Attestation Profile
 */
app.get('/api/agent-profile', async (req, res) => {
  try {
    const record = await readAuditAttestation(AGENT_SUBNAME);
    const wallet = await getAgentWalletStatus();
    res.json({
      agentName: AGENT_SUBNAME,
      subname: AGENT_SUBNAME,
      agentAddress: wallet.address || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
      wallet,
      resolverAddress: RESOLVER_ADDRESS,
      eacScoped: true,
      lastAuditRecord: record,
      network: 'Ethereum Sepolia (Chain ID: 11155111)',
      bazanticGateway: {
        active: true,
        protocol: 'x402',
        facilitator: FACILITATOR_ADDRESS
      },
      faucets: [
        'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
        'https://www.alchemy.com/faucets/ethereum-sepolia',
        'https://sepolia-faucet.pk910.de/'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve agent profile', details: err.message });
  }
});

/**
 * Query Presets for Subgraph Studio
 */
app.get('/api/presets', (req, res) => {
  res.json({
    presets: [
      {
        id: 'uniswap_top_5',
        name: 'Uniswap v3 Top 5 TVL Pools',
        description: 'Queries top liquidity pools on Ethereum Mainnet ordered by total value locked',
        limit: 5
      },
      {
        id: 'uniswap_top_10',
        name: 'Uniswap v3 Top 10 High Volume Pools',
        description: 'Expanded set of active trading pools with high 24h volume metrics',
        limit: 10
      },
      {
        id: 'stable_depth',
        name: 'Stablecoin Depth Pools (USDC/USDT/DAI)',
        description: 'Focuses on 0.01% and 0.05% fee tier stablecoin pairing depth',
        limit: 4
      }
    ]
  });
});

/**
 * Explicit 402 Challenge Inspector endpoint
 */
app.get('/api/challenge', (req, res) => {
  const nonce = `mpp_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  res.status(402)
    .set('WWW-Authenticate', `x402 realm="bazantic-mpp-gateway", price="0.001 ETH", facilitator="${FACILITATOR_ADDRESS}"`)
    .json({
      error: 'Payment Required',
      statusCode: 402,
      protocol: 'x402',
      challenge: {
        scheme: 'x402',
        realm: 'bazantic-mpp-gateway',
        facilitator: FACILITATOR_ADDRESS,
        recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: '0.001',
        amountWei: '1000000000000000',
        asset: 'ETH',
        network: 'sepolia',
        chainId: 11155111,
        nonce,
        pricingTier: 'audit-compute-standard',
        requiredHeader: 'Authorization: Bearer bazantic_mpp_<token>',
        description: 'Bazantic Micropayment Required: 0.001 ETH to execute live Subgraph Studio indexing & ENSv2 Sepolia attestation write'
      }
    });
});

/**
 * Model Context Protocol (MCP) JSON-RPC Endpoint for AI Agents
 */
app.post('/api/mcp', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'graphagent-gateway-mcp', version: '1.0.0' }
      }
    });
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'audit_pool_liquidity',
            description: 'Queries The Graph Subgraph Studio for DEX liquidity pools, computes a deterministic keccak256 audit hash, and writes on-chain attestation to the ENSv2 Permissioned Resolver on Sepolia.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', default: 5 },
                preset: { type: 'string', default: 'uniswap_top_5' }
              }
            }
          },
          {
            name: 'get_ens_attestation',
            description: 'Reads the latest attested cryptographic audit hash from the ENSv2 Permissioned Resolver on Ethereum Sepolia.',
            inputSchema: {
              type: 'object',
              properties: {
                subname: { type: 'string', default: AGENT_SUBNAME }
              }
            }
          }
        ]
      }
    });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    if (toolName === 'audit_pool_liquidity') {
      const graphResult = await fetchSubgraphLiquidity({ limit: params?.arguments?.limit || 5 });
      const ensResult = await writeAuditAttestation({
        subname: AGENT_SUBNAME,
        reportHash: graphResult.reportHash
      });
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                reportHash: graphResult.reportHash,
                txHash: ensResult.txHash,
                poolsCount: graphResult.pools.length,
                totalTvlUSD: graphResult.summary.totalTvlUSD,
                liquidityScore: graphResult.summary.liquidityScore
              }, null, 2)
            }
          ]
        }
      });
    }

    if (toolName === 'get_ens_attestation') {
      const record = await readAuditAttestation(params?.arguments?.subname || AGENT_SUBNAME);
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(record, null, 2) }]
        }
      });
    }
  }

  res.status(400).json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Unsupported method: ${method}` }
  });
});

/**
 * POST /api/run-audit
 * Core pipeline handler:
 * 1. Checks for Bazantic Gateway authorization header (`authorization: Bearer bazantic_mpp_...`). If missing, returns HTTP 402 challenge.
 * 2. Queries The Graph Subgraph Studio using live GraphQL (Uniswap v3 pool metrics).
 * 3. Generates deterministic audit hash of data.
 * 4. Interacts with ENSv2 Permissioned Resolver on Ethereum Sepolia using viem to write records['last_audit_hash'].
 * 5. Returns JSON response.
 */
app.post('/api/run-audit', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const isBazanticAuthorized = authHeader.startsWith('Bearer bazantic_mpp_');

  // Step 1: Enforce Bazantic x402 Gateway Authorization
  if (!isBazanticAuthorized) {
    const nonce = `mpp_nonce_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    res.set('WWW-Authenticate', `x402 realm="bazantic-mpp-gateway", price="0.001 ETH", facilitator="${FACILITATOR_ADDRESS}"`);
    return res.status(402).json({
      error: 'Payment Required',
      statusCode: 402,
      protocol: 'x402',
      challenge: {
        scheme: 'x402',
        realm: 'bazantic-mpp-gateway',
        facilitator: FACILITATOR_ADDRESS,
        recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: '0.001',
        amountWei: '1000000000000000',
        asset: 'ETH',
        network: 'sepolia',
        chainId: 11155111,
        nonce,
        pricingTier: 'audit-compute-standard',
        requiredHeader: 'Authorization: Bearer bazantic_mpp_<token>',
        description: 'Bazantic Micropayment Required: 0.001 ETH to execute live Subgraph Studio indexing & ENSv2 Sepolia attestation write'
      },
      message: 'x402 Challenge: Missing or invalid Bazantic MPP authorization bearer token.'
    });
  }

  const sessionToken = authHeader.replace('Bearer ', '');
  const poolLimit = req.body && req.body.limit ? parseInt(req.body.limit, 10) : 5;

  try {
    console.log(`[Bazantic Gateway] Authenticated request with session ${sessionToken.substring(0, 18)}...`);

    // Step 2: Query The Graph Subgraph Studio
    console.log(`[The Graph] Querying Subgraph Studio for top ${poolLimit} pools...`);
    const graphResult = await fetchSubgraphLiquidity({ limit: poolLimit });
    console.log(`[The Graph] Fetched ${graphResult.pools.length} pools from ${graphResult.source}. ReportHash: ${graphResult.reportHash}`);

    // Step 3 & 4: ENSv2 Permissioned Resolver on Sepolia
    console.log(`[ENSv2] Attesting audit hash to resolver for subname ${AGENT_SUBNAME}...`);
    const ensResult = await writeAuditAttestation({
      subname: AGENT_SUBNAME,
      reportHash: graphResult.reportHash
    });
    console.log(`[ENSv2] Attestation complete -> txHash: ${ensResult.txHash} (Simulated: ${ensResult.isSimulated})`);

    // Step 5: Format response matching required schema
    res.json({
      success: true,
      agentName: AGENT_SUBNAME,
      subname: AGENT_SUBNAME,
      agentAddress: ensResult.agentAddress || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
      reportHash: graphResult.reportHash,
      txHash: ensResult.txHash,
      blockNumber: ensResult.blockNumber,
      recordKey: ensResult.recordKey,
      resolverAddress: ensResult.resolverAddress,
      pools: graphResult.pools,
      summary: graphResult.summary,
      graphSource: graphResult.source,
      isLive: graphResult.isLive,
      isGraphLive: graphResult.isLive,
      ensAttestation: {
        success: ensResult.success,
        node: ensResult.node,
        agentAddress: ensResult.agentAddress,
        network: ensResult.network,
        isSimulated: ensResult.isSimulated,
        calldata: ensResult.calldata
      },
      gateway: {
        authenticated: true,
        protocol: 'x402',
        facilitator: FACILITATOR_ADDRESS,
        sessionToken
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(`[Pipeline Error] ${err.message}`, err);
    res.status(500).json({
      success: false,
      error: 'Audit pipeline execution failure',
      details: err.message
    });
  }
});

// Serve static frontend build if present (for single-container production deploys)
const clientDist = join(__dirname, '../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(clientDist, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[Sentinel402 Gateway] Server listening on http://${HOST}:${PORT}`);
  console.log(`[Sentinel402 Gateway] Subname: ${AGENT_SUBNAME} | Facilitator: ${FACILITATOR_ADDRESS}`);
});
