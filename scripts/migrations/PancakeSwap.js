// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0xbcfccbde45ce874adcb698cc183debcf17952812";
const INIT_CODE = "0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66";
const FEE = 998;

const deployPancakeSwap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PancakeSwap = await ethers.getContractFactory("UniswapV2Fork");
  const pancakeSwap = await PancakeSwap.deploy("PancakeSwap", "1.0.0");
  await pancakeSwap.deployed();

  console.log("PancakeSwap address:", pancakeSwap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "PancakeSwap",
      address: pancakeSwap.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    pancakeSwap.address,
  );
  await tx.wait();
  console.log("PancakeSwap Whitelisted");

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
  await augustus.initializeAdapter(pancakeSwap.address, data);

  return pancakeSwap;
};

module.exports = {
  deployPancakeSwap,
};
