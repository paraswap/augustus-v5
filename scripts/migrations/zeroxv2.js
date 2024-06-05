// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const web3Coder = require("web3-eth-abi");

const ZRX_ERC20_PROXY = process.env.ZRX_ERC20_PROXY || "0x95e6f48254609a6ee006f7d493c8e5fb97094cef";

const ZRX_V2_WHITELISTED_MM = [
  "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9",
  "0xAB4f75DDc6fEffbf25Ef95361170780e37C5726b",
  "0x919CbB0be55ba996A567107EA13f417Be74e477A",
  "0x61aDaF40A389761BacF76dFcCf682e9200989894",
  "0x912C43E04Bc77d5D64E234d92821b6BB52666F2C",
];

const deployZeroxV2 = async (whitelisted, augustus, isTenderly) => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ZeroxV2 = await ethers.getContractFactory("ZeroxV2");
  const zeroxV2 = await ZeroxV2.deploy();
  await zeroxV2.deployed();

  console.log("ZeroxV2 address:", zeroxV2.address);

  if (isTenderly) {
    await tenderlyRPC.verify({
      name: "ZeroxV2",
      address: zeroxV2.address,
    });
  }

  var tx = await whitelisted.grantRole(
    "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49",
    zeroxV2.address,
  );
  await tx.wait();
  console.log("ZeroxV2 Whitelisted");

  var data = web3Coder.encodeParameter(
    {
      ParentStruct: {
        erc20Proxy: "address",
        makerWhitelist: "address[]",
      },
    },
    {
      erc20Proxy: ZRX_ERC20_PROXY,
      makerWhitelist: ZRX_V2_WHITELISTED_MM,
    },
  );
  await augustus.initializeAdapter(zeroxV2.address, data);

  return zeroxV2;
};

module.exports = {
  deployZeroxV2,
};
