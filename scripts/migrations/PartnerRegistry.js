// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployPartnerRegistry = async (partnerDeployer, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PartnerRegistry = await ethers.getContractFactory("PartnerRegistry");
  const partnerRegistry = await PartnerRegistry.deploy(partnerDeployer.address);
  await partnerRegistry.deployed();

  console.log("partnerRegistry address:", partnerRegistry.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "PartnerRegistry",
      address: partnerRegistry.address,
    });
  }
  return partnerRegistry;
};

module.exports = {
  deployPartnerRegistry,
};
