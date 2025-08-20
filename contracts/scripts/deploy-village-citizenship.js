const hre = require("hardhat");

async function main() {
  console.log("Deploying VillageCitizenship contract...");

  // Deploy VillageCitizenship contract
  console.log("Deploying VillageCitizenship...");
  const VillageCitizenship = await hre.ethers.getContractFactory("VillageCitizenship");
  const villageCitizenship = await VillageCitizenship.deploy();
  await villageCitizenship.waitForDeployment();
  const villageCitizenshipAddress = await villageCitizenship.getAddress();
  console.log("VillageCitizenship deployed to:", villageCitizenshipAddress);

  // Verify contract on Snowtrace (if on Fuji)
  if (hre.network.name === "fuji") {
    console.log("Waiting for block confirmations...");
    await villageCitizenship.deploymentTransaction().wait(6);
    
    try {
      console.log("Verifying VillageCitizenship on Snowtrace...");
      await hre.run("verify:verify", {
        address: villageCitizenshipAddress,
        constructorArguments: [],
      });
      console.log("VillageCitizenship verified on Snowtrace!");
    } catch (error) {
      console.log("VillageCitizenship verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contract: {
      villageCitizenship: villageCitizenshipAddress,
    },
    deployer: await villageCitizenship.signer.getAddress(),
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
  
  // Instructions for integration
  console.log("\n=== INTEGRATION INSTRUCTIONS ===");
  console.log("1. Update contract addresses in src/lib/contracts.ts");
  console.log("2. Update database contract_addresses table");
  console.log("3. Test village citizenship functionality");
  console.log("\nContract address saved for frontend integration.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
