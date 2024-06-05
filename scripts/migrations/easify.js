// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const CETH_ADDRESS = process.env.CETH_ADDRESS || "0x8f23952aA7A41F9D1Ae719432b3b7552a13BA015";

const deployEasyfi = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Easyfi = await ethers.getContractFactory("Easyfi");
  const easyfi = await Easyfi.deploy();
  await easyfi.deployed();

  console.log("Easyfi address:", easyfi.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Easyfi",
      address: easyfi.address,
    });
  }

  var role = await whitelisted.WHITELISTED_ROLE();
  var tx = await whitelisted.grantRole(role, easyfi.address);
  await tx.wait();
  var isWhitelisted = await whitelisted.hasRole(role, easyfi.address);

  if (isWhitelisted) {
    console.log("Easyfi Whitelisted");
  } else {
    console.log("Easyfi not whitelisted");
  }

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        ceth: "address",
      },
    },
    {
      ceth: CETH_ADDRESS,
    },
  );

  console.log(data);
  await augustus.initializeAdapter(easyfi.address, data);

  return easyfi;
};

module.exports = {
  deployEasyfi,
};
