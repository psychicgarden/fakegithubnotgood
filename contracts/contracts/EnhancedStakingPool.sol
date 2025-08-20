// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EnhancedStakingPool is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // USDT Token Interface
    IERC20 public usdtToken;
    
    // Treasury wallet for management fees
    address public treasuryWallet;
    
    // Staking state
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userRewardDebt;
    uint256 public totalDeposits;
    uint256 public totalRewards;
    uint256 public rewardsPerShare;
    uint256 public lastUpdateTime;
    
    // Constants
    uint256 public constant MANAGEMENT_FEE_PERCENT = 2; // 2% management fee
    uint256 public constant MINIMUM_DEPOSIT = 1000 * 10**6; // $1,000 USDT minimum
    uint256 public constant REWARD_UPDATE_INTERVAL = 1 days;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 lpTokens);
    event Withdrawn(address indexed user, uint256 lpTokens, uint256 usdtAmount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event MortgageInterestReceived(uint256 amount);
    event AppreciationShareReceived(uint256 amount);
    event ManagementFeeCollected(uint256 amount);

    constructor(address _usdtToken, address _treasuryWallet) ERC20("Ancient Staking Pool", "ASP") {
        require(_usdtToken != address(0), "Invalid USDT address");
        require(_treasuryWallet != address(0), "Invalid treasury address");
        
        usdtToken = IERC20(_usdtToken);
        treasuryWallet = _treasuryWallet;
        lastUpdateTime = block.timestamp;
    }

    // Deposit USDT and receive LP tokens
    function deposit(uint256 amount) external nonReentrant {
        require(amount >= MINIMUM_DEPOSIT, "Minimum deposit is $1,000 USDT");
        require(usdtToken.balanceOf(msg.sender) >= amount, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= amount, "Insufficient USDT allowance");
        
        // Update rewards
        updateRewards();
        
        // Transfer USDT
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        // Calculate LP tokens to mint
        uint256 lpTokensToMint;
        if (totalSupply() == 0) {
            lpTokensToMint = amount;
        } else {
            lpTokensToMint = amount.mul(totalSupply()).div(totalDeposits);
        }
        
        // Update state
        userDeposits[msg.sender] = userDeposits[msg.sender].add(amount);
        totalDeposits = totalDeposits.add(amount);
        userRewardDebt[msg.sender] = userRewardDebt[msg.sender].add(lpTokensToMint.mul(rewardsPerShare).div(1e18));
        
        // Mint LP tokens
        _mint(msg.sender, lpTokensToMint);
        
        emit Deposited(msg.sender, amount, lpTokensToMint);
    }

    // Withdraw USDT by burning LP tokens
    function withdraw(uint256 lpTokens) external nonReentrant {
        require(lpTokens > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= lpTokens, "Insufficient LP tokens");
        
        // Update rewards
        updateRewards();
        
        // Calculate USDT to return
        uint256 usdtToReturn = lpTokens.mul(totalDeposits).div(totalSupply());
        
        // Update state
        userDeposits[msg.sender] = userDeposits[msg.sender].sub(usdtToReturn);
        totalDeposits = totalDeposits.sub(usdtToReturn);
        userRewardDebt[msg.sender] = userRewardDebt[msg.sender].sub(lpTokens.mul(rewardsPerShare).div(1e18));
        
        // Burn LP tokens
        _burn(msg.sender, lpTokens);
        
        // Transfer USDT
        require(usdtToken.transfer(msg.sender, usdtToReturn), "USDT transfer failed");
        
        emit Withdrawn(msg.sender, lpTokens, usdtToReturn);
    }

    // Claim accumulated rewards
    function claimRewards() external nonReentrant {
        updateRewards();
        
        uint256 pendingRewards = pendingRewards(msg.sender);
        require(pendingRewards > 0, "No rewards to claim");
        
        userRewardDebt[msg.sender] = userRewardDebt[msg.sender].add(pendingRewards.mul(1e18).div(balanceOf(msg.sender)));
        
        require(usdtToken.transfer(msg.sender, pendingRewards), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, pendingRewards);
    }

    // Receive mortgage interest from AncientMortgage contract
    function receiveMortgageInterest(uint256 amount) external {
        require(msg.sender == owner(), "Only owner can call this");
        require(amount > 0, "Amount must be greater than 0");
        
        updateRewards();
        
        // Calculate management fee
        uint256 managementFee = amount.mul(MANAGEMENT_FEE_PERCENT).div(100);
        uint256 netRewards = amount.sub(managementFee);
        
        // Send management fee to treasury
        if (managementFee > 0) {
            require(usdtToken.transfer(treasuryWallet, managementFee), "Management fee transfer failed");
            emit ManagementFeeCollected(managementFee);
        }
        
        // Distribute net rewards to stakers
        if (totalSupply() > 0) {
            rewardsPerShare = rewardsPerShare.add(netRewards.mul(1e18).div(totalSupply()));
        }
        
        totalRewards = totalRewards.add(netRewards);
        
        emit MortgageInterestReceived(amount);
    }

    // Receive appreciation share from AncientMortgage contract
    function receiveAppreciationShare(uint256 amount) external {
        require(msg.sender == owner(), "Only owner can call this");
        require(amount > 0, "Amount must be greater than 0");
        
        updateRewards();
        
        // Calculate management fee
        uint256 managementFee = amount.mul(MANAGEMENT_FEE_PERCENT).div(100);
        uint256 netRewards = amount.sub(managementFee);
        
        // Send management fee to treasury
        if (managementFee > 0) {
            require(usdtToken.transfer(treasuryWallet, managementFee), "Management fee transfer failed");
            emit ManagementFeeCollected(managementFee);
        }
        
        // Distribute net rewards to stakers
        if (totalSupply() > 0) {
            rewardsPerShare = rewardsPerShare.add(netRewards.mul(1e18).div(totalSupply()));
        }
        
        totalRewards = totalRewards.add(netRewards);
        
        emit AppreciationShareReceived(amount);
    }

    // Update rewards calculation
    function updateRewards() public {
        if (block.timestamp >= lastUpdateTime.add(REWARD_UPDATE_INTERVAL)) {
            lastUpdateTime = block.timestamp;
        }
    }

    // Calculate pending rewards for a user
    function pendingRewards(address user) public view returns (uint256) {
        uint256 userBalance = balanceOf(user);
        if (userBalance == 0) return 0;
        
        uint256 currentRewardsPerShare = rewardsPerShare;
        if (totalSupply() > 0) {
            // Calculate additional rewards since last update
            uint256 timeElapsed = block.timestamp.sub(lastUpdateTime);
            if (timeElapsed > 0) {
                // This would include additional rewards calculation if needed
            }
        }
        
        return userBalance.mul(currentRewardsPerShare).div(1e18).sub(userRewardDebt[user]);
    }

    // Get current APY (based on recent rewards)
    function getCurrentAPY() external view returns (uint256) {
        if (totalDeposits == 0) return 0;
        
        // Calculate APY based on recent rewards
        uint256 annualRewards = totalRewards.mul(365).div(30); // Assuming 30-day period
        return annualRewards.mul(10000).div(totalDeposits); // Return in basis points
    }

    // Get user's total value (deposits + pending rewards)
    function getUserTotalValue(address user) external view returns (uint256) {
        uint256 deposits = userDeposits[user];
        uint256 rewards = pendingRewards(user);
        return deposits.add(rewards);
    }

    // Emergency functions (owner only)
    function setTreasuryWallet(address _treasuryWallet) external onlyOwner {
        treasuryWallet = _treasuryWallet;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        if (balance > 0) {
            require(usdtToken.transfer(owner(), balance), "Emergency withdrawal failed");
        }
    }
}
