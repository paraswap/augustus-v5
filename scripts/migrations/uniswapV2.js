// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const INIT_CODE = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";

const deployUniswapV2 = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const UniswapV2 = await ethers.getContractFactory("UniswapV2");
  const uniswapV2 = await UniswapV2.deploy();
  await uniswapV2.deployed();

  console.log("UniswapV2 address:", uniswapV2.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "UniswapV2",
      address: uniswapV2.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    uniswapV2.address,
  );
  await tx.wait();
  console.log("UniswapV2 Whitelisted");

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
  await augustus.initializeAdapter(uniswapV2.address, data);

  return uniswapV2;
};

module.exports = {
  deployUniswapV2,
};
