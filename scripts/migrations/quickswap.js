// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const INIT_CODE = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

const deployQuickSwap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const QuickSwap = await ethers.getContractFactory("UniswapV2");
  const quickSwap = await QuickSwap.deploy("QuickSwap", "1.0.0");
  await quickSwap.deployed();

  console.log("QuickSwap address:", quickSwap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "QuickSwap",
      address: quickSwap.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    quickSwap.address,
  );
  await tx.wait();
  console.log("QuickSwap Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        uinswapV2Router: "address",
        factory: "address",
        initCode: "bytes32",
      },
    },
    {
      uinswapV2Router: ROUTER,
      factory: FACTORY,
      initCode: INIT_CODE,
    },
  );
  await augustus.initializeAdapter(quickSwap.address, data);

  return quickSwap;
};

module.exports = {
  deployQuickSwap,
};
