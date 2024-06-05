// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const CURVE_COMPOUND = process.env.CURVE_COMPOUND || "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56";
const DAI = process.env.DAI || "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC = process.env.USDC || "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const cDAI = process.env.CDAI || "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
const cUSDC = process.env.CUSDC || "0x39aa39c021dfbae8fac545936693ac917d5e7563";

const deployAcryptos = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Curve = await ethers.getContractFactory("Curve");
  const acryptos = await Curve.deploy();
  await acryptos.deployed();

  console.log("Curve address:", acryptos.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Curve",
      address: acryptos.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    acryptos.address,
  );
  await tx.wait();
  console.log("Curve Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        dai: "address",
        usdc: "address",
        cDAI: "address",
        cUSDC: "address",
        curveCompoundExchange: "address",
      },
    },
    {
      dai: DAI,
      usdc: USDC,
      cDAI: cDAI,
      cUSDC: cUSDC,
      curveCompoundExchange: CURVE_COMPOUND,
    },
  );
  await augustus.initializeAdapter(acryptos.address, data);

  return acryptos;
};

module.exports = {
  deployAcryptos,
};
