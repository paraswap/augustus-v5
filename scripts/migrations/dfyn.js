const web3Coder = require("web3-eth-abi");

const ROUTER = process.env_UNISWAPV2_ROUTER || "0x0000000000000000000000000000000000000000";
const FACTORY = process.env_UNISWAPV2_FACTORY || "0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429\n";
const INIT_CODE = "0x9f65a71165f3fd2ff219941a904202d9afc94d6cc1dd770b71677e36967cffb0";
const FEE = 997;
const contractName = "Dfyn";

const deployDfyn = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Cometh = await ethers.getContractFactory("UniswapV2Fork");
  const cometh = await Cometh.deploy(contractName, "1.0.0");
  await cometh.deployed();

  console.log(`${contractName} deployed to ${cometh.address}`);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: contractName,
      address: cometh.address,
    });
  }

  const tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    cometh.address,
  );

  await tx.wait();
  console.log("Cometh Whitelisted");

  const data = web3Coder.encodeParameter(
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
  deployDfyn,
};
