// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const CETH_ADDRESS = process.env.CETH_ADDRESS || "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

const deployCompound = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Compound = await ethers.getContractFactory("Compound");
  const compound = await Compound.deploy();
  await compound.deployed();

  console.log("Compound address:", compound.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Compound",
      address: compound.address,
    });
  }

  var role = await whitelisted.WHITELISTED_ROLE();
  var tx = await whitelisted.grantRole(role, compound.address);
  await tx.wait();
  var isWhitelisted = await whitelisted.hasRole(role, compound.address);

  if (isWhitelisted) {
    console.log("Compound Whitelisted");
  } else {
    console.log("Compound not whitelisted");
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

  await augustus.initializeAdapter(compound.address, data);

  return compound;
};

module.exports = {
  deployCompound,
};
