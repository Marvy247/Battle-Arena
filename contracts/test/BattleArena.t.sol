// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BattleArena.sol";

contract BattleArenaTest is Test {
    BattleArena public battleArena;

    address public player1 = address(0x123);
    address public player2 = address(0x456);

    function setUp() public {
        battleArena = new BattleArena();
    }

    function testSubmitScore() public {
        vm.prank(player1);
        battleArena.submitScore(100);

        // Check NFT minted
        assertEq(battleArena.balanceOf(player1), 1);

        // Check leaderboard
        BattleArena.ScoreEntry[] memory leaderboard = battleArena.getLeaderboard();
        assertEq(leaderboard.length, 1);
        assertEq(leaderboard[0].player, player1);
        assertEq(leaderboard[0].score, 100);
    }

    function testLeaderboardUpdate() public {
        vm.prank(player1);
        battleArena.submitScore(50);

        vm.prank(player2);
        battleArena.submitScore(100);

        BattleArena.ScoreEntry[] memory leaderboard = battleArena.getLeaderboard();
        assertEq(leaderboard.length, 2);
        assertEq(leaderboard[0].score, 100); // Highest first
        assertEq(leaderboard[1].score, 50);
    }

    function testPlayerHighScore() public {
        vm.prank(player1);
        battleArena.submitScore(50);

        vm.prank(player1);
        battleArena.submitScore(100);

        assertEq(battleArena.playerHighScore(player1), 100);
    }

    function testRevertZeroScore() public {
        vm.prank(player1);
        vm.expectRevert("Score must be greater than 0");
        battleArena.submitScore(0);
    }
}
