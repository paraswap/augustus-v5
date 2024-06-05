// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const REGISTRY = process.env.BANCOR_REGISTRY || "0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4";
const PATH_FINDER = process.env_BANCOR_PATHFINDER || "0x6F0cD8C4f6F06eAB664C7E3031909452b4B72861";
const ETHER_TOKEN = process.env.BANCOR_ETHER_TOKEN || "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315";

const deployBancor = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Bancor = await ethers.getContractFactory("Bancor");
  const bancor = await Bancor.deploy();
  await bancor.deployed();

  console.log("Bancor address:", bancor.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Bancor",
      address: bancor.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    bancor.address,
  );
  await tx.wait();
  console.log("Bancor Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        affiliateAccount: "address",
        affiliateCode: "uint256",
        etherToken: "address",
        contractRegistry: "address",
        pathFinder: "address",
      },
    },
    {
      affiliateAccount: "0x0000000000000000000000000000000000000000",
      affiliateCode: 0,
      etherToken: ETHER_TOKEN,
      contractRegistry: REGISTRY,
      pathFinder: PATH_FINDER,
    },
  );
  await augustus.initializeAdapter(bancor.address, data);

  return bancor;
};

module.exports = {
  deployBancor,
};
