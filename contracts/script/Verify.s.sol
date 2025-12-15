// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

contract Verify is Script {
    function run() external view {
        address contractAddress = 0x6805D21E2cB99e4DfEd8D79fa04CfeE09c8DBC08;
        
        console.log("Contract to verify:", contractAddress);
        console.log("Network: Somnia Mainnet");
        console.log("Chain ID: 5031");
        console.log("");
        console.log("To verify this contract, run:");
        console.log("");
        console.log("forge verify-contract \\");
        console.log("  --chain-id 5031 \\");
        console.log("  --rpc-url https://api.infra.mainnet.somnia.network \\");
        console.log("  --verifier blockscout \\");
        console.log("  --verifier-url https://mainnet.somnia.w3us.site/api \\");
        console.log("  0x6805D21E2cB99e4DfEd8D79fa04CfeE09c8DBC08 \\");
        console.log("  src/BattleArena.sol:BattleArena");
    }
}
