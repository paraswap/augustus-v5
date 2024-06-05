// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const KYBER_FEE_WALLET = process.env.KYBER_FEE_WALLET || "0x7f0aF2BDfCCBfDB0704DcC155F4a9453D2097289";
const KYBER_PLATFORM_FEE_BPS = process.env.KYBER_PLATFORM_FEE_BPS || 0;
const KYBER_PROXY = process.env.KYBER_PROXY || "0x9AAb3f75489902f3a48495025729a0AF77d4b11e";
const KYBER_HINT = process.env.KYBER_HINT || "0xa1c0fa73c39cfbcc11ec9eb1afc665aba9996e2c";
const BRIGED_RESERVES = [
  "0xbb4f617369730000000000000000000000000000000000000000000000000000", //OASIS
  "0xbb756e6973776170563100000000000000000000000000000000000000000000", //UNISWAP
  "0xbb756e6973776170563200000000000000000000000000000000000000000000", //UNISWAPV2
  "0xbb42414e434f5230305632000000000000000000000000000000000000000000", //BANCOR
];

const deployKyber = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Kyber = await ethers.getContractFactory("Kyber");
  const kyber = await Kyber.deploy();
  await kyber.deployed();

  console.log("Kyber address:", kyber.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "Kyber",
      address: kyber.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    kyber.address,
  );
  await tx.wait();
  console.log("Kyber Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        feeWallet: "address",
        platformFeeBps: "uint256",
        kyberProxy: "address",
        kyberHint: "address",
        brigedReserves: "bytes32[]",
      },
    },
    {
      feeWallet: KYBER_FEE_WALLET,
      platformFeeBps: KYBER_PLATFORM_FEE_BPS,
      kyberProxy: KYBER_PROXY,
      kyberHint: KYBER_HINT,
      brigedReserves: BRIGED_RESERVES,
    },
  );
  await augustus.initializeAdapter(kyber.address, data);

  return kyber;
};

module.exports = {
  deployKyber,
};
