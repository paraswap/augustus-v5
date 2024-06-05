import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getConfig } from "../config";
import { waitforme } from "../helpers/utils";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("AugustusRFQRouter");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  if (!config.AUGUSTUS_RFQ) {
    console.log("ERROR: AUGUSTUS_RFQ NOT CONFIGURED, ROUTER WILL NOT BE DEPLOYED!");
    await waitforme(10000);
    return;
  }
  const result = await deploy("AugustusRFQRouter", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [config.WETH, config.AUGUSTUS_RFQ],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const rfqRouter = await deployments.get("AugustusRFQRouter");
    const rfqRouterInstance = await ethers.getContractAt(artifact.abi, rfqRouter.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusInstance.grantRole(role, rfqRouter.address);
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQ"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQNFT"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQNFTWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("partialSwapOnAugustusRFQ"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("partialSwapOnAugustusRFQWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("partialSwapOnAugustusRFQNFT"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("partialSwapOnAugustusRFQNFTWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQTryBatchFill"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("swapOnAugustusRFQTryBatchFillWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("buyOnAugustusRFQTryBatchFill"),
      rfqRouter.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      rfqRouterInstance.interface.getSighash("buyOnAugustusRFQTryBatchFillWithPermit"),
      rfqRouter.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "AugustusRFQRouter",
        address: rfqRouter.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: rfqRouter.address,
        constructorArguments: [config.WETH, config.AUGUSTUS_RFQ],
      });
    }
  }
};
export default func;
func.tags = ["AugustusRFQRouter"];
