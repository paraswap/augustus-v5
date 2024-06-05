// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0x800b052609c355cA8103E06F022aA30647eAd60a";
const INIT_CODE = "0x499154cad90a3563f914a25c3710ed01b9a43b8471a35ba8a66a056f37638542";
const FEE = 995;

const deployCometh = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Cometh = await ethers.getContractFactory("UniswapV2Fork");
  const cometh = await Cometh.deploy("ComethSwap", "1.0.0");
  await cometh.deployed();

  console.log("Cometh address:", cometh.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Cometh",
      address: cometh.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    cometh.address,
  );
  await tx.wait();
  console.log("Cometh Whitelisted");

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
  await augustus.initializeAdapter(cometh.address, data);

  return cometh;
};

module.exports = {
  deployCometh,
};
