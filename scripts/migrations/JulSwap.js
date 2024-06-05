// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0x553990f2cba90272390f62c5bdb1681ffc899675";
const INIT_CODE = "0xb1e98e21a5335633815a8cfb3b580071c2e4561c50afd57a8746def9ed890b18";
const FEE = 997;

const deployJulSwap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const JulSwap = await ethers.getContractFactory("UniswapV2Fork");
  const julSwap = await JulSwap.deploy("JulSwap", "1.0.0");
  await julSwap.deployed();

  console.log("JulSwap address:", julSwap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "JulSwap",
      address: julSwap.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    julSwap.address,
  );
  await tx.wait();
  console.log("JulSwap Whitelisted");

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
  await augustus.initializeAdapter(julSwap.address, data);

  return julSwap;
};

module.exports = {
  deployJulSwap,
};
