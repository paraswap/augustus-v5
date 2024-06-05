// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const { deployWhitelist } = require("./Whitelist");
const { deployPartnerDeployer } = require("./PartnerDeployer");
const { deployPartnerRegistry } = require("./PartnerRegistry");
const { deployAugustus } = require("./Augustus");
const { deployUniswap } = require("./Uniswap");
const { deployCompound } = require("./Compound");
const { deployCurve } = require("./Curve");
const { deployKyber } = require("./kyber");
const { deployAave } = require("./aave");
const { deployBancor } = require("./Bancor");
const { deployBZX } = require("./Fulcrum");
const { deployChai } = require("./Chai");
const { deployWeth } = require("./weth");
const { deployZeroxV2 } = require("./zeroxv2");
const { deployZeroxV3 } = require("./zeroxV3");
const { deployUniswapV2 } = require("./uniswapV2");
const { deployBalancer } = require("./balancer");
const { deployShell } = require("./Shell");
const { deployAavee2 } = require("./aave2");
const { deployDODO } = require("./dodo");
const { deployZeroxv4 } = require("./zeroxv4");
const { deployBakerySwap } = require("./bakeryswap");
const { deployJulSwap } = require("./JulSwap");
const { deployAcryptos } = require("./acryptos");
const { deployStreetSwap } = require("./StreetSwap");
const { deployPancakeSwap } = require("./PancakeSwap");
const { deployEasyfi } = require("./easify");
const { deployQuickSwap } = require("./quickswap");
const { deployAavee2Matic } = require("./aaveMatic");
const { deployCometh } = require("./cometh");
const { deployDfyn } = require("./dfyn");

const hardhat = require("hardhat");
const { network, deployments } = require("hardhat");

const hre = require("hardhat");

async function main() {
  const isTenderly = network.name === "tenderly";
  const isEthereum = network.name === "ropsten" || network.name === "mainnet" || network.name === "rinkeby";
  const isBSC = network.name === "bscTestnet" || network.name === "bsc";
  const isPolygon = network.name === "polygon";

  const isEtherscan = isEthereum || isBSC || isPolygon;

  console.log("Deploying for network", network.name);

  if (network.name === "tenderly") {
    await tenderlyRPC.initializeFork();

    const fork = tenderlyRPC.getFork();
    console.log("Tenderly Fork", fork);

    provider = new ethers.providers.Web3Provider(tenderlyRPC);
    //Set the ethers provider to the one we initialized so it targets the correct backend
    ethers.provider = provider;
  }
  if (
    network.name === "ropsten" ||
    network.name === "mainnet" ||
    network.name === "rinkeby" ||
    network.name === "bscTestnet" ||
    network.name === "bsc"
  ) {
    isEtherscan = true;
  }
  if (network.name === "bscTestnet" || network.name === "bsc") {
    isEthereum = false;
    isBSC = true;
  }
  if (network.name === "polygonTestnet" || network.name === "polygon") {
    isEthereum = false;
    isPolygon = true;
  }

  const whitelisted = await deployWhitelist(isTenderly);
  const partnerDeployer = await deployPartnerDeployer(isTenderly);
  const partnerRegistry = await deployPartnerRegistry(partnerDeployer, isTenderly);
  const augustus = await deployAugustus(whitelisted, partnerRegistry, isTenderly);
  const uniswap = await deployUniswap(whitelisted, augustus, isTenderly);
  const weth = await deployWeth(whitelisted, augustus, isTenderly);

  if (isEthereum) {
    const compound = await deployCompound(whitelisted, augustus, isTenderly);
    const curve = await deployCurve(whitelisted, augustus, isTenderly);
    const kyber = await deployKyber(whitelisted, augustus, isTenderly);
    const aave = await deployAave(whitelisted, augustus, isTenderly);
    const bancor = await deployBancor(whitelisted, augustus, isTenderly);
    const fulcrum = await deployBZX(whitelisted, augustus, isTenderly);
    const chai = await deployChai(whitelisted, augustus, isTenderly);
    const zeroxv2 = await deployZeroxV2(whitelisted, augustus, isTenderly);
    const zeroxV3 = await deployZeroxV3(whitelisted, augustus, isTenderly);
    const uniswapV2 = await deployUniswapV2(whitelisted, augustus, isTenderly);
    const balancer = await deployBalancer(whitelisted, augustus, isTenderly);
    const aave2 = await deployAavee2(whitelisted, augustus, isTenderly);
    const shell = await deployShell(whitelisted, augustus, isTenderly);
    const dodo = await deployDODO(whitelisted, augustus, isTenderly);
    const zeroxv4 = await deployZeroxv4(whitelisted, augustus, isTenderly);

    if (isEtherscan) {
      await hre.run("verify:verify", {
        address: whitelisted.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerDeployer.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerRegistry.address,
        constructorArguments: [partnerDeployer.address],
      });
      await hre.run("verify:verify", {
        address: augustus.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: uniswap.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: compound.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: curve.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: kyber.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: aave.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: bancor.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: fulcrum.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: dodo.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: zeroxv4.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: chai.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: weth.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: zeroxv2.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: zeroxV3.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: uniswapV2.address,
        constructorArguments: ["UniswapV2", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: balancer.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: aave2.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: shell.address,
        constructorArguments: [],
      });
    }

    return {
      whitelisted: whitelisted.address,
      partnerDeployer: partnerDeployer.address,
      partnerRegistry: partnerRegistry.address,
      augustus: augustus.address,
      uniswap: uniswap.address,
      compound: compound.address,
      curve: curve.address,
      kyber: kyber.address,
      aave: aave.address,
      bancor: bancor.address,
      fulcrum: fulcrum.address,
      chai: chai.address,
      weth: weth.address,
      zeroxv2: zeroxv2.address,
      zeroxV3: zeroxV3.address,
      uniswapV2: uniswapV2.address,
      balancer: balancer.address,
      aave2: aave2.address,
      shell: shell.address,
      dodo: dodo.address,
      zeroxv4: zeroxv4.address,
    };
  } else if (isBSC) {
    const bakeryswap = await deployBakerySwap(whitelisted, augustus, isTenderly);
    const julSwap = await deployJulSwap(whitelisted, augustus, isTenderly);
    const acryptos = await deployAcryptos(whitelisted, augustus, isTenderly);
    const streetSwap = await deployStreetSwap(whitelisted, augustus, isTenderly);
    const pancakeSwap = await deployPancakeSwap(whitelisted, augustus, isTenderly);

    if (isEtherscan) {
      await hre.run("verify:verify", {
        address: whitelisted.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerDeployer.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerRegistry.address,
        constructorArguments: [partnerDeployer.address],
      });
      await hre.run("verify:verify", {
        address: augustus.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: weth.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: bakeryswap.address,
        constructorArguments: ["BakerySwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: julSwap.address,
        constructorArguments: ["JulSwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: acryptos.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: streetSwap.address,
        constructorArguments: ["ShellSwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: pancakeSwap.address,
        constructorArguments: ["PancakeSwap", "1.0.0"],
      });
    }

    return {
      whitelisted: whitelisted.address,
      partnerDeployer: partnerDeployer.address,
      partnerRegistry: partnerRegistry.address,
      augustus: augustus.address,
      bakeryswap: bakeryswap.address,
      julSwap: julSwap.address,
      acryptos: acryptos.address,
      streetSwap: streetSwap.address,
      pancakeSwap: pancakeSwap.address,
      weth: weth.address,
    };
  } else if (isPolygon) {
    const quickswap = await deployQuickSwap(whitelisted, augustus, isTenderly);
    const easify = await deployEasyfi(whitelisted, augustus, isTenderly);
    const aaveMatic = await deployAavee2Matic(whitelisted, augustus, isTenderly);
    const cometh = await deployCometh(whitelisted, augustus, isTenderly);
    const dfyn = await deployDfyn(whitelisted, augustus, isTenderly);

    if (isEtherscan) {
      await hre.run("verify:verify", {
        address: whitelisted.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerDeployer.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: partnerRegistry.address,
        constructorArguments: [partnerDeployer.address],
      });
      await hre.run("verify:verify", {
        address: augustus.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: weth.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: quickswap.address,
        constructorArguments: ["QuickSwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: cometh.address,
        constructorArguments: ["ComethSwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: easify.address,
        constructorArguments: [],
      });
      await hre.run("verify:verify", {
        address: aaveMatic.address,
        constructorArguments: ["ShellSwap", "1.0.0"],
      });
      await hre.run("verify:verify", {
        address: dfyn.address,
        constructorArguments: ["ShellSwap", "1.0.0"],
      });
    }

    return {
      whitelisted: whitelisted.address,
      partnerDeployer: partnerDeployer.address,
      partnerRegistry: partnerRegistry.address,
      augustus: augustus.address,
      quickswap: quickswap.address,
      easify: easify.address,
      aaveMatic: aaveMatic.address,
      cometh: cometh.address,
      weth: weth.address,
      dfyn: dfyn.address,
    };
  }
}

main()
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
