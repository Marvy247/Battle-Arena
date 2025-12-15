#!/bin/bash

# BattleArena Contract Verification Script for Somnia Mainnet
# Contract Address: 0x6805D21E2cB99e4DfEd8D79fa04CfeE09c8DBC08

CONTRACT_ADDRESS="0x6805D21E2cB99e4DfEd8D79fa04CfeE09c8DBC08"
CHAIN_ID="5031"
RPC_URL="https://api.infra.mainnet.somnia.network"
VERIFIER="blockscout"
VERIFIER_URL="https://mainnet.somnia.w3us.site/api"
CONTRACT_PATH="src/BattleArena.sol:BattleArena"

echo "=========================================="
echo "BattleArena Contract Verification"
echo "=========================================="
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Network: Somnia Mainnet"
echo "Chain ID: $CHAIN_ID"
echo "=========================================="
echo ""

# Check if forge is installed
if ! command -v forge &> /dev/null
then
    echo "❌ Error: Foundry (forge) is not installed."
    echo "Please install Foundry: https://book.getfoundry.sh/getting-started/installation"
    exit 1
fi

echo "🔍 Verifying contract on Somnia Mainnet..."
echo ""

# Method 1: Using Blockscout API (Recommended for Somnia)
echo "📝 Attempting verification with Blockscout..."
forge verify-contract \
  --chain-id $CHAIN_ID \
  --rpc-url $RPC_URL \
  --verifier $VERIFIER \
  --verifier-url $VERIFIER_URL \
  $CONTRACT_ADDRESS \
  $CONTRACT_PATH

VERIFY_STATUS=$?

if [ $VERIFY_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Contract verified successfully!"
    echo "🔗 View on explorer: https://mainnet.somnia.w3us.site/address/$CONTRACT_ADDRESS"
else
    echo ""
    echo "⚠️  Verification failed or contract already verified."
    echo ""
    echo "Alternative verification methods:"
    echo ""
    echo "1. Using flattened contract:"
    echo "   forge verify-contract \\"
    echo "     --chain-id $CHAIN_ID \\"
    echo "     --rpc-url $RPC_URL \\"
    echo "     --verifier $VERIFIER \\"
    echo "     --verifier-url $VERIFIER_URL \\"
    echo "     $CONTRACT_ADDRESS \\"
    echo "     BattleArena-flattened.sol:BattleArena"
    echo ""
    echo "2. Manual verification via Blockscout UI:"
    echo "   Visit: https://mainnet.somnia.w3us.site/address/$CONTRACT_ADDRESS"
    echo "   Click 'Verify & Publish' and upload the flattened contract"
    echo ""
    echo "3. Check if already verified:"
    echo "   Visit: https://mainnet.somnia.w3us.site/address/$CONTRACT_ADDRESS#code"
fi

echo ""
echo "=========================================="
