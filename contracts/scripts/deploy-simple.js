const hre = require("hardhat");

async function main() {
  console.log("Deploying Simple Token Purchase contract...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SimpleTokenPurchase
  const SimpleTokenPurchase = await hre.ethers.getContractFactory("SimpleTokenPurchase");
  const simpleTokenPurchase = await SimpleTokenPurchase.deploy();
  await simpleTokenPurchase.waitForDeployment();
  const simpleTokenPurchaseAddress = await simpleTokenPurchase.getAddress();
  
  console.log("SimpleTokenPurchase deployed to:", simpleTokenPurchaseAddress);
  console.log("Contract owner:", await simpleTokenPurchase.owner());

  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await simpleTokenPurchase.deploymentTransaction().wait(6);

  // Verify on Snowtrace
  console.log("Verifying SimpleTokenPurchase on Snowtrace...");
  try {
    await hre.run("verify:verify", {
      address: simpleTokenPurchaseAddress,
      constructorArguments: [],
    });
    console.log("SimpleTokenPurchase verified on Snowtrace");
  } catch (error) {
    console.log("SimpleTokenPurchase verification failed:", error.message);
  }

  // Deployment info
  const deploymentInfo = {
    network: "fuji",
    contracts: {
      simpleTokenPurchase: simpleTokenPurchaseAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n=== TESTING INSTRUCTIONS ===");
  console.log("1. Call purchaseTokens() with 0.1 AVAX to buy tokens");
  console.log("2. Call getUserTokens(address) to see user's tokens");
  console.log("3. Call getToken(tokenId) to see token details");
  console.log("4. Call getUserTotalInvested(address) to see total investment");
  
  console.log("\nContract addresses saved for frontend integration.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
