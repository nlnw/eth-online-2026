#!/usr/bin/env node

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
const shouldSave = process.argv.includes('--save');

function main() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  console.log(`\n======================================================`);
  console.log(` Sentinel402 Gateway - Sepolia Testnet Keypair Generator`);
  console.log(`======================================================\n`);

  console.log(`Generated Address:   ${account.address}`);
  console.log(`Generated Key:       ${privateKey}`);
  console.log(`\nNetwork:             Ethereum Sepolia (Chain ID 11155111)`);
  console.log(`Subname to Attest:   auditor.sentinel402.eth`);
  console.log(`Resolver Contract:   0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41\n`);

  console.log(`Get Free Sepolia Testnet ETH:`);
  console.log(`  1. Google Cloud Web3 Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia`);
  console.log(`  2. Alchemy Sepolia Faucet:    https://www.alchemy.com/faucets/ethereum-sepolia`);
  console.log(`  3. Infura Sepolia Faucet:     https://www.infura.io/faucet/sepolia\n`);

  if (shouldSave) {
    if (existsSync(envPath)) {
      let envContent = readFileSync(envPath, 'utf8');
      if (envContent.includes('AGENT_PRIVATE_KEY=')) {
        envContent = envContent.replace(/AGENT_PRIVATE_KEY=.*/, `AGENT_PRIVATE_KEY=${privateKey}`);
      } else {
        envContent += `\nAGENT_PRIVATE_KEY=${privateKey}\n`;
      }
      writeFileSync(envPath, envContent, 'utf8');
      console.log(`[SUCCESS] Saved AGENT_PRIVATE_KEY to local .env file (gitignored).`);
    } else {
      console.log(`[NOTICE] No .env file found to update.`);
    }
  } else {
    console.log(`To use this key locally in simulation-free on-chain mode:`);
    console.log(`  Run with '--save' flag: npm run generate-wallet -- --save`);
    console.log(`  Or manually paste AGENT_PRIVATE_KEY=${privateKey} into your local .env file.`);
    console.log(`  (Note: .env is in .gitignore and will NEVER be committed to Git).\n`);
  }
}

main();
