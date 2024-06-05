// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0xac653ce27e04c6ac565fd87f18128ad33ca03ba2";
const INIT_CODE = "0x0b3961eeccfbf746d2d5c59ee3c8ae3a5dcf8dc9b0dfb6f89e1e8ca0b32b544b";
const FEE = 996;

const deployStreetSwap = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const StreetSwap = await ethers.getContractFactory("UniswapV2Fork");
  const streetSwap = await StreetSwap.deploy("ShellSwap", "1.0.0");
  await streetSwap.deployed();

  console.log("StreetSwap address:", streetSwap.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "StreetSwap",
      address: streetSwap.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    streetSwap.address,
  );
  await tx.wait();
  console.log("StreetSwap Whitelisted");

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
  await augustus.initializeAdapter(streetSwap.address, data);

  return streetSwap;
};

module.exports = {
  deployStreetSwap,
};
