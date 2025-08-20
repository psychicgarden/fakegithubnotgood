// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDT is ERC20, Ownable {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**6); // Mint 1M USDT (6 decimals)
    }

    // Mint function for testing
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Decimals override (USDT has 6 decimals)
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
} 