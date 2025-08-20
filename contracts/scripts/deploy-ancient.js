const hre = require("hardhat");

async function main() {
  console.log("Deploying Ancient Mortgage Protocol contracts...");

  // Deploy Mock USDT first
  console.log("Deploying Mock USDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("Mock USDT deployed to:", mockUSDTAddress);

  // Deploy Ancient Mortgage Protocol
  console.log("Deploying Ancient Mortgage Protocol...");
  const AncientMortgageProtocol = await hre.ethers.getContractFactory("AncientMortgageProtocol");
  const mortgageProtocol = await AncientMortgageProtocol.deploy(mockUSDTAddress);
  await mortgageProtocol.waitForDeployment();
  const mortgageProtocolAddress = await mortgageProtocol.getAddress();
  console.log("Ancient Mortgage Protocol deployed to:", mortgageProtocolAddress);

  // Mint some USDT to the deployer for testing
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting USDT to deployer for testing...");
  await mockUSDT.mint(deployer.address, 100000 * 10**6); // 100k USDT
  console.log("Minted 100,000 USDT to deployer");

  // Verify contracts on Snowtrace (if on Fuji)
  if (hre.network.name === "fuji") {
    console.log("Waiting for block confirmations...");
    await mockUSDT.deploymentTransaction().wait(6);
    await mortgageProtocol.deploymentTransaction().wait(6);
    
    try {
      console.log("Verifying Mock USDT on Snowtrace...");
      await hre.run("verify:verify", {
        address: mockUSDTAddress,
        constructorArguments: [],
      });
      console.log("Mock USDT verified on Snowtrace!");
    } catch (error) {
      console.log("Mock USDT verification failed:", error.message);
    }

    try {
      console.log("Verifying Ancient Mortgage Protocol on Snowtrace...");
      await hre.run("verify:verify", {
        address: mortgageProtocolAddress,
        constructorArguments: [mockUSDTAddress],
      });
      console.log("Ancient Mortgage Protocol verified on Snowtrace!");
    } catch (error) {
      console.log("Ancient Mortgage Protocol verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contracts: {
      mockUSDT: mockUSDTAddress,
      mortgageProtocol: mortgageProtocolAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for testing
  console.log("\n=== TESTING INSTRUCTIONS ===");
  console.log("1. Approve USDT spending for the mortgage protocol");
  console.log("2. Call verifyKYC() to enable purchases");
  console.log("3. Call purchaseProperty() to buy a property");
  console.log("4. Call makePayment() to make mortgage payments");
  console.log("\nContract addresses saved for frontend integration.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 