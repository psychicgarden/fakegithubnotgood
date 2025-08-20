const hre = require("hardhat");

async function main() {
  console.log("Deploying MortgageProtocol contract...");

  const MortgageProtocol = await hre.ethers.getContractFactory("MortgageProtocol");
  const mortgageProtocol = await MortgageProtocol.deploy();

  await mortgageProtocol.deployed();

  console.log("MortgageProtocol deployed to:", mortgageProtocol.address);
  console.log("Network:", hre.network.name);
  
  // Verify contract on Snowtrace (if on Fuji)
  if (hre.network.name === "fuji") {
    console.log("Waiting for block confirmations...");
    await mortgageProtocol.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: mortgageProtocol.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Snowtrace!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: mortgageProtocol.address,
    deployer: await mortgageProtocol.signer.getAddress(),
    timestamp: new Date().toISOString(),
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 