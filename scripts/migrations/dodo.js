// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ERC_20_PROXY = process.env.DODO_ERC20_PROXY || "0xcb859ea579b28e02b87a1fde08d087ab9dbe5149";

const deployDODO = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const DODO = await ethers.getContractFactory("DODO");
  const dODO = await DODO.deploy();
  await dODO.deployed();

  console.log("DODO address:", dODO.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "DODO",
      address: dODO.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    dODO.address,
  );
  await tx.wait();
  console.log("DODO Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        erc20ApproveProxy: "address",
      },
    },
    {
      erc20ApproveProxy: ERC_20_PROXY,
    },
  );
  await augustus.initializeAdapter(dODO.address, data);

  return dODO;
};

module.exports = {
  deployDODO,
};
