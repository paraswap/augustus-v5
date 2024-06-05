// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const AAVE_AFFILIATE_CODE = 1;
const AAVE_SPENDER = "0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3";

const deployAave = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Aavee = await ethers.getContractFactory("Aavee");
  const aavee = await Aavee.deploy();
  await aavee.deployed();

  console.log("Aavee address:", aavee.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Aavee",
      address: aavee.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    aavee.address,
  );
  await tx.wait();
  console.log("Aavee Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        refCode: "uint16",
        spender: "address",
      },
    },
    {
      refCode: AAVE_AFFILIATE_CODE,
      spender: AAVE_SPENDER,
    },
  );
  await augustus.initializeAdapter(aavee.address, data);

  return aavee;
};

module.exports = {
  deployAave,
};
