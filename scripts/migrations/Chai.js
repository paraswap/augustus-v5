// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployChai = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ChaiExchange = await ethers.getContractFactory("ChaiExchange");
  const chaiExchange = await ChaiExchange.deploy();
  await chaiExchange.deployed();

  console.log("ChaiExchange address:", chaiExchange.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "ChaiExchange",
      address: chaiExchange.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    chaiExchange.address,
  );
  await tx.wait();
  console.log("ChaiExchange Whitelisted");

  return chaiExchange;
};

module.exports = {
  deployChai,
};
