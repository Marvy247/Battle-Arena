// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BattleArena is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable(msg.sender) {
    uint256 private _tokenIdCounter;

    struct ScoreEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }

    ScoreEntry[] public leaderboard;
    mapping(address => uint256) public playerHighScore;

    event ScoreSubmitted(address indexed player, uint256 score, uint256 tokenId, uint256 timestamp);

    constructor() ERC721("BattleArena Score NFT", "BAS") {}

    function submitScore(uint256 score) public {
        require(score > 0, "Score must be greater than 0");

        // Update player high score
        if (score > playerHighScore[msg.sender]) {
            playerHighScore[msg.sender] = score;
        }

        // Mint NFT
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // Enhanced metadata with dynamic image and rarity
        string memory rarity = score >= 1000 ? "Legendary" : score >= 500 ? "Epic" : score >= 200 ? "Rare" : "Common";
        string memory imageUrl = string(abi.encodePacked(
            "https://api.example.com/generate-nft?score=", Strings.toString(score),
            "&rarity=", rarity,
            "&player=", Strings.toHexString(uint160(msg.sender), 20)
        ));
        string memory metadata = string(abi.encodePacked(
            '{"name": "BattleArena Score #', Strings.toString(tokenId),
            '", "description": "Score NFT for BattleArena game on Somnia Testnet", "image": "', imageUrl,
            '", "attributes": [',
            '{"trait_type": "Player", "value": "', Strings.toHexString(uint160(msg.sender), 20), '"},',
            '{"trait_type": "Score", "value": "', Strings.toString(score), '"},',
            '{"trait_type": "Rarity", "value": "', rarity, '"},',
            '{"trait_type": "Timestamp", "value": "', Strings.toString(block.timestamp), '"}',
            ']}'
        ));
        _setTokenURI(tokenId, string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata)))));

        // Add to leaderboard (simple insertion sort for top 10)
        _updateLeaderboard(ScoreEntry(msg.sender, score, block.timestamp));

        // Emit event for SDS streaming
        emit ScoreSubmitted(msg.sender, score, tokenId, block.timestamp);
    }

    function _updateLeaderboard(ScoreEntry memory newEntry) internal {
        // Simple top 10 leaderboard
        if (leaderboard.length < 10) {
            leaderboard.push(newEntry);
        } else if (newEntry.score > leaderboard[leaderboard.length - 1].score) {
            leaderboard[leaderboard.length - 1] = newEntry;
        }
        // Sort descending (basic bubble sort for small list)
        for (uint i = 0; i < leaderboard.length - 1; i++) {
            for (uint j = 0; j < leaderboard.length - i - 1; j++) {
                if (leaderboard[j].score < leaderboard[j + 1].score) {
                    ScoreEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }

    function getLeaderboard() public view returns (ScoreEntry[] memory) {
        return leaderboard;
    }

    function getLeaderboardLength() public view returns (uint256) {
        return leaderboard.length;
    }

    function claimReward() public {
        require(leaderboard.length > 0, "No scores yet");
        require(msg.sender == leaderboard[0].player, "Only top player can claim reward");
        require(block.timestamp > leaderboard[0].timestamp + 7 days, "Wait 7 days after setting record");

        // Mint special reward NFT (simplified - in reality, you'd have a separate contract)
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        string memory metadata = string(abi.encodePacked(
            '{"name": "BattleArena Champion #', Strings.toString(tokenId),
            '", "description": "Champion reward for BattleArena", "attributes": [',
            '{"trait_type": "Type", "value": "Champion"},',
            '{"trait_type": "Score", "value": "', Strings.toString(leaderboard[0].score), '"}',
            ']}'
        ));
        _setTokenURI(tokenId, string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata)))));
    }

    function getUserTokens(address user) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(user, i);
        }
        return tokens;
    }

    // Override functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
