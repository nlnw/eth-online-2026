#!/usr/bin/env node

/**
 * Sentinel402 Gateway - Model Context Protocol (MCP) Server
 * 
 * Target Bounty: The Graph — Best AI Tooling / AI Use Case (From Scratch)
 * 
 * Provides native AI Agent integration via the Model Context Protocol (MCP) JSON-RPC standard.
 * Compatible with Claude Desktop, Cursor, Antigravity, and autonomous LLM agents.
 */

import readline from 'readline';
import { fetchSubgraphLiquidity } from '../server/src/graph.js';
import { writeAuditAttestation, readAuditAttestation } from '../server/src/ens.js';

const SERVER_NAME = 'sentinel402-gateway-mcp';
const SERVER_VERSION = '1.0.0';
const DEFAULT_SUBNAME = 'auditor.sentinel402.eth';
const DEFAULT_RESOLVER = '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';
const FACILITATOR = '0x4020000000000000000000000000000000000001';

const TOOLS = [
  {
    name: 'audit_pool_liquidity',
    description: 'Queries The Graph Subgraph Studio for DEX liquidity pools, computes a deterministic keccak256 audit hash, and writes on-chain attestation to the ENSv2 Permissioned Resolver on Sepolia.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top pools to query by TVL (default: 5)',
          default: 5
        },
        preset: {
          type: 'string',
          description: 'Query preset: uniswap_top_5, uniswap_top_10, or stable_depth',
          default: 'uniswap_top_5'
        }
      }
    }
  },
  {
    name: 'get_ens_attestation',
    description: 'Reads the latest attested cryptographic audit hash from the ENSv2 Permissioned Resolver on Ethereum Sepolia for an agent subname.',
    inputSchema: {
      type: 'object',
      properties: {
        subname: {
          type: 'string',
          description: 'Target ENSv2 subname (default: auditor.sentinel402.eth)',
          default: DEFAULT_SUBNAME
        }
      }
    }
  },
  {
    name: 'get_bazantic_challenge',
    description: 'Retrieves the x402 Micropayment Protocol challenge specification and facilitator contract details for Bazantic gateway execution.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_agent_wallet_profile',
    description: 'Retrieves the agent wallet address, live Sepolia ETH balance, ENSv2 subname, and faucet funding options.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Handle JSON-RPC Tool Calls
async function handleCallTool(params) {
  const { name, arguments: args } = params;

  switch (name) {
    case 'audit_pool_liquidity': {
      const limit = (args && args.limit) || 5;
      const graphResult = await fetchSubgraphLiquidity({ limit });
      const ensResult = await writeAuditAttestation({
        subname: DEFAULT_SUBNAME,
        reportHash: graphResult.reportHash
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                agentName: DEFAULT_SUBNAME,
                subname: DEFAULT_SUBNAME,
                agentAddress: ensResult.agentAddress,
                reportHash: graphResult.reportHash,
                txHash: ensResult.txHash,
                blockNumber: ensResult.blockNumber,
                recordKey: ensResult.recordKey,
                poolsCount: graphResult.pools.length,
                totalTvlUSD: graphResult.summary.totalTvlUSD,
                total24hVolumeUSD: graphResult.summary.total24hVolumeUSD,
                liquidityScore: graphResult.summary.liquidityScore,
                riskProfile: graphResult.summary.riskLevel,
                graphSource: graphResult.source,
                isSimulatedSepolia: ensResult.isSimulated
              },
              null,
              2
            )
          }
        ]
      };
    }

    case 'get_ens_attestation': {
      const subname = (args && args.subname) || DEFAULT_SUBNAME;
      const record = await readAuditAttestation(subname);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(record, null, 2)
          }
        ]
      };
    }

    case 'get_bazantic_challenge': {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                protocol: 'x402',
                scheme: 'x402',
                realm: 'bazantic-mpp-gateway',
                price: '0.001 ETH',
                facilitator: FACILITATOR,
                network: 'Ethereum Sepolia (Chain ID 11155111)',
                requiredHeader: 'Authorization: Bearer bazantic_mpp_<token>'
              },
              null,
              2
            )
          }
        ]
      };
    }

    case 'get_agent_wallet_profile': {
      const { getAgentWalletStatus } = await import('../server/src/ens.js');
      const wallet = await getAgentWalletStatus();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                agentName: DEFAULT_SUBNAME,
                subname: DEFAULT_SUBNAME,
                agentAddress: wallet.address || '0x6BB8f6Ca13DfC7f83E568E1080A66bFd81a6aC5f',
                balanceEth: wallet.balanceEth,
                balanceWei: wallet.balanceWei,
                isFunded: wallet.isFunded,
                network: 'Ethereum Sepolia (Chain ID 11155111)',
                resolverAddress: DEFAULT_RESOLVER,
                faucets: [
                  'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
                  'https://www.alchemy.com/faucets/ethereum-sepolia',
                  'https://sepolia-faucet.pk910.de/'
                ]
              },
              null,
              2
            )
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// JSON-RPC stdio message loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line.trim()) return;

  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    switch (method) {
      case 'initialize':
        console.log(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: SERVER_NAME, version: SERVER_VERSION }
            }
          })
        );
        break;

      case 'tools/list':
        console.log(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { tools: TOOLS }
          })
        );
        break;

      case 'tools/call': {
        const result = await handleCallTool(params);
        console.log(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            result
          })
        );
        break;
      }

      default:
        console.log(
          JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` }
          })
        );
    }
  } catch (err) {
    console.error(`[MCP Error] ${err.message}`);
  }
});
