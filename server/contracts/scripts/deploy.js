const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Get contract deployment parameters
  const {
    propertyName,
    propertyLocation,
    propertyValue,
    totalTokenSupply,
    pricePerToken,
    tokenName,
    tokenSymbol
  } = process.env;

  if (!propertyName || !propertyLocation || !propertyValue) {
    throw new Error("Missing required property parameters in environment variables");
  }

  // Deploy Identity Registry
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistryLite");
  const identityRegistry = await IdentityRegistry.deploy(deployer.address);
  await identityRegistry.waitForDeployment();
  console.log("IdentityRegistryLite deployed to:", await identityRegistry.getAddress());

  // Deploy Compliance
  const Compliance = await ethers.getContractFactory("ComplianceLite");
  const compliance = await Compliance.deploy(deployer.address);
  await compliance.waitForDeployment();
  console.log("ComplianceLite deployed to:", await compliance.getAddress());

  // Deploy Real Estate Token
  const RealEstateToken = await ethers.getContractFactory("RealEstateERC3643");
  const realEstateToken = await RealEstateToken.deploy(
    tokenName || `${propertyName} Token`,
    tokenSymbol || propertyName.substring(0, 4).toUpperCase(),
    deployer.address,
    await identityRegistry.getAddress(),
    await compliance.getAddress(),
    propertyName,
    propertyLocation,
    ethers.parseEther(propertyValue.toString()),
    totalTokenSupply || "1000000",
    ethers.parseEther(pricePerToken?.toString() || "100")
  );
  await realEstateToken.waitForDeployment();
  console.log("RealEstateERC3643 deployed to:", await realEstateToken.getAddress());

  // Return deployment info
  const deploymentInfo = {
    identityRegistry: await identityRegistry.getAddress(),
    compliance: await compliance.getAddress(),
    realEstateToken: await realEstateToken.getAddress(),
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString()
  };

  console.log("Deployment completed:", deploymentInfo);
  return deploymentInfo;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };