// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT uses 6 decimals
    
    constructor() ERC20("Test USDT", "tUSDT") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**6); // 1M USDT
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Mint function for testing (owner only)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Burn function
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
