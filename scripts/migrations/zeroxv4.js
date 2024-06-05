// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployZeroxv4 = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ZeroxV4 = await ethers.getContractFactory("ZeroxV4");
  const zeroxV4 = await ZeroxV4.deploy();
  await zeroxV4.deployed();

  console.log("ZeroxV4 address:", zeroxV4.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "ZeroxV4",
      address: zeroxV4.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    zeroxV4.address,
  );
  await tx.wait();
  console.log("ZeroxV4 Whitelisted");

  return zeroxV4;
};

module.exports = {
  deployZeroxv4,
};
