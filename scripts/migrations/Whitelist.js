// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployWhitelist = async isTenderly => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Whitelisted = await ethers.getContractFactory("Whitelisted");
  const whitelisted = await Whitelisted.deploy();
  await whitelisted.deployed();

  console.log("Whitelisted address:", whitelisted.address);
  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Whitelisted",
      address: whitelisted.address,
    });
  }

  return whitelisted;
};

module.exports = {
  deployWhitelist,
};
