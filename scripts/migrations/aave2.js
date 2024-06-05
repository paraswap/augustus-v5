// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const AAVE_AFFILIATE_CODE = 1;
const LENDING_POOL = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
const WETH_GATEWAY = "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04";

const deployAavee2 = async (whitelisted, augustus, isTenderly) => {
  /**const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Aavee2 = await ethers.getContractFactory("Aavee2");
  const aavee2 = await Aavee2.deploy();
  await aavee2.deployed();

  console.log("Aavee2 address:", aavee2.address);

  if(isTenderly) {
    await tenderlyRPC.verify({
      name: "Aavee2",
      address: aavee2.address,
    });
  }

  var tx = await whitelisted.grantRole("0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49", aavee2.address);
await tx.wait();
  console.log("Aavee2 Whitelisted");*/

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
  console.log(data);
  /**await augustus.initializeAdapter(aavee2.address, data);

  return aavee2;*/
};
deployAavee2();

module.exports = {
  deployAavee2,
};
