// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployPartnerDeployer = async isTenderly => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PartnerDeployer = await ethers.getContractFactory("PartnerDeployer");
  const partnerDeployer = await PartnerDeployer.deploy();
  await partnerDeployer.deployed();

  console.log("partnerDeployer address:", partnerDeployer.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "PartnerDeployer",
      address: partnerDeployer.address,
    });
  }

  return partnerDeployer;
};
module.exports = {
  deployPartnerDeployer,
};
