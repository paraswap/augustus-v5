// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const AAVE_AFFILIATE_CODE = 1;
const LENDING_POOL = "0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf";
const WETH_GATEWAY = "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97";

const deployAavee2Matic = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const AaveeMatic = await ethers.getContractFactory("AaveeMatic");
  const aavee2Matic = await AaveeMatic.deploy();
  await aavee2Matic.deployed();

  console.log("AaveeMatic address:", aavee2Matic.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "AaveeMatic",
      address: aavee2Matic.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    aavee2Matic.address,
  );
  await tx.wait();
  console.log("AaveeMatic Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        refCode: "uint16",
        lendingPool: "address",
        wethGateway: "address",
      },
    },
    {
      refCode: AAVE_AFFILIATE_CODE,
      lendingPool: LENDING_POOL,
      wethGateway: WETH_GATEWAY,
    },
  );
  await augustus.initializeAdapter(aavee2Matic.address, data);

  return aavee2Matic;
};

module.exports = {
  deployAavee2Matic,
};
