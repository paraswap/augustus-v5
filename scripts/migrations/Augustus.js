// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
const REDUX_TOKEN = process.env.REDUX_TOKEN || "0x0000000000b3F879cb30FE243b4Dfee438691c04";
const FEE_WALLET = process.env.FEE_WALLET || "0x7f0aF2BDfCCBfDB0704DcC155F4a9453D2097289";
const UNISWAP_FACTORY = process.env.UNISWAP_FACTORY || "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UNISWAP_INIT_CODE =
  process.env.UNISWAP_INIT_CODE || "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
const PROXY_ADMIN = process.env.PROXY_ADMIN || "0x05182E579FDfCf69E4390c3411D8FeA1fb6467cf";
const TIME_LOCK = process.env.TIME_LOCK || 200;

const deployAugustus = async (whitelisted, partnerRegistry, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const AugustusSwapper = await ethers.getContractFactory("AugustusSwapper");
  const augustusSwapper = await AugustusSwapper.deploy();
  await augustusSwapper.deployed();

  console.log("AugustusSwapper address:", augustusSwapper.address);
  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "AugustusSwapper",
      address: augustusSwapper.address,
    });
  }

  const UniswapProxy = await ethers.getContractFactory("UniswapProxy");
  const uniswapProxy = await UniswapProxy.deploy();
  await uniswapProxy.deployed();

  console.log("UniswapProxy address:", uniswapProxy.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "UniswapProxy",
      address: uniswapProxy.address,
    });
  }
  await augustusSwapper.initialize(
    whitelisted.address,
    REDUX_TOKEN,
    partnerRegistry.address,
    FEE_WALLET,
    uniswapProxy.address,
    TIME_LOCK,
  );
  return augustusSwapper;
};

module.exports = {
  deployAugustus,
};
