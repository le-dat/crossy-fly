// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrossyfluffleGame {
    event Move(
        address indexed player,
        uint256 indexed moveNumber,
        string direction,
        uint256 score
    );

    mapping(address => uint256) private moveCount;
    mapping(address => uint256) private highScore;

    function recordMove(string calldata direction, uint256 score) external {
        moveCount[msg.sender]++;
        if (score > highScore[msg.sender]) {
            highScore[msg.sender] = score;
        }
        emit Move(msg.sender, moveCount[msg.sender], direction, score);
    }

    function getPlayerStats(
        address player
    ) external view returns (uint256, uint256) {
        return (moveCount[player], highScore[player]);
    }
}
