// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const AAVE_AFFILIATE_CODE = 1;
const LENDING_POOL = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
const WETH_GATEWAY = "0xDcD33426BA191383f1c9B431A342498fdac73488";

const deployShell = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Shell = await ethers.getContractFactory("Shell");
  const shell = await Shell.deploy();
  await shell.deployed();

  console.log("Shell address:", shell.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Shell",
      address: shell.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    shell.address,
  );
  await tx.wait();
  console.log("Shell Whitelisted");

  return shell;
};

module.exports = {
  deployShell,
};
