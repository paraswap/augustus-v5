// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const FACTORY = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";

const deployUniswap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Uniswap = await ethers.getContractFactory("Uniswap");
  const uniswap = await Uniswap.deploy("Uniswap", "1.0.0");
  await uniswap.deployed();

  console.log("Uniswap address:", uniswap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Uniswap",
      address: uniswap.address,
    });
  }
  var role = await whitelisted.WHITELISTED_ROLE();
  var tx = await whitelisted.grantRole(role, uniswap.address);
  await tx.wait();
  var isWhitelisted = await whitelisted.hasRole(role, uniswap.address);
  console.log(role, uniswap.address, isWhitelisted);
  if (isWhitelisted) {
    console.log("Uniswap Whitelisted");
  } else {
    console.log("Uniswap not whitelisted");
  }

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        factory: "address",
      },
    },
    {
      factory: FACTORY,
    },
  );
  await augustus.initializeAdapter(uniswap.address, data);

  return uniswap;
};

module.exports = {
  deployUniswap,
};
