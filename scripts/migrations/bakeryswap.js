// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0x01bf7c66c6bd861915cdaae475042d3c4bae16a7";
const INIT_CODE = "0xe2e87433120e32c4738a7d8f3271f3d872cbe16241d67537139158d90bac61d3";
const FEE = 997;

const deployBakerySwap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const BakerySwap = await ethers.getContractFactory("UniswapV2Fork");
  const bakerySwap = await BakerySwap.deploy("BakerySwap", "1.0.0");
  await bakerySwap.deployed();

  console.log("BakerySwap address:", bakerySwap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "BakerySwap",
      address: bakerySwap.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    bakerySwap.address,
  );
  await tx.wait();
  console.log("BakerySwap Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        uinswapV2Router: "address",
        factory: "address",
        initCode: "bytes32",
        feeMultiplicationFactor: "uint256",
      },
    },
    {
      uinswapV2Router: ROUTER,
      factory: FACTORY,
      initCode: INIT_CODE,
      feeMultiplicationFactor: FEE,
    },
  );
  await augustus.initializeAdapter(bakerySwap.address, data);

  return bakerySwap;
};

module.exports = {
  deployBakerySwap,
};
