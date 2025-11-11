// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BattleArena.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        BattleArena battleArena = new BattleArena();

        vm.stopBroadcast();

        console.log("BattleArena deployed to:", address(battleArena));
    }
}
