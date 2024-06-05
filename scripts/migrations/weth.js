// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const deployWeth = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const WethExchange = await ethers.getContractFactory("WethExchange");
  const weth = await WethExchange.deploy();
  await weth.deployed();

  console.log("WethExchange address:", weth.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "WethExchange",
      address: weth.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    weth.address,
  );
  await tx.wait();
  console.log("WethExchange Whitelisted");

  return weth;
};

module.exports = {
  deployWeth,
};
