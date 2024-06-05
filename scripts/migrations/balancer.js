// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const BALANCER_REGISTRY = process.env.BALANCER_REGISTRY || "0x56B63acAc8bEe02F71BAb31ad3bfce3a77DE666A";

const deployBalancer = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Balancer = await ethers.getContractFactory("Balancer");
  const balancer = await Balancer.deploy();
  await balancer.deployed();

  console.log("Balancer address:", balancer.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Balancer",
      address: balancer.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    balancer.address,
  );
  await tx.wait();
  console.log("Balancer Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        balancerRegistry: "address",
      },
    },
    {
      balancerRegistry: BALANCER_REGISTRY,
    },
  );
  await augustus.initializeAdapter(balancer.address, data);

  return balancer;
};

module.exports = {
  deployBalancer,
};
