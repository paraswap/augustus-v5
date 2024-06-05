// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ZRX_ERC20_PROXY = process.env.ZRX_ERC20_PROXY || "0x95e6f48254609a6ee006f7d493c8e5fb97094cef";

const deployZeroxV3 = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ZeroxV3 = await ethers.getContractFactory("ZeroxV3");
  const zeroxV3 = await ZeroxV3.deploy();
  await zeroxV3.deployed();

  console.log("ZeroxV3 address:", zeroxV3.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "ZeroxV3",
      address: zeroxV3.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    zeroxV3.address,
  );
  await tx.wait();
  console.log("ZeroxV3 Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        erc20Proxy: "address",
      },
    },
    {
      erc20Proxy: ZRX_ERC20_PROXY,
    },
  );
  await augustus.initializeAdapter(zeroxV3.address, data);

  return zeroxV3;
};

module.exports = {
  deployZeroxV3,
};
