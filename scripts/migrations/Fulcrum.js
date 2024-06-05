// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployBZX = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const BZX = await ethers.getContractFactory("BZX");
  const bzx = await BZX.deploy();
  await bzx.deployed();

  console.log("BZX address:", bzx.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "BZX",
      address: bzx.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    bzx.address,
  );
  await tx.wait();
  console.log("BZX Whitelisted");

  return bzx;
};

module.exports = {
  deployBZX,
};
