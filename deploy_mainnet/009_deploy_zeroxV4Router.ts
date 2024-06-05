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
  const artifact = await deployments.getArtifact("ZeroxV4Router");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  const result = await deploy("ZeroxV4Router", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [config.WETH],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const zeroxv4 = await deployments.get("ZeroxV4Router");
    const zeroxv4Instance = await ethers.getContractAt(artifact.abi, zeroxv4.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusInstance.grantRole(role, zeroxv4.address);
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      zeroxv4Instance.interface.getSighash("swapOnZeroXv4"),
      zeroxv4.address,
    );
    await tx.wait();
    tx = await augustusInstance.setImplementation(
      zeroxv4Instance.interface.getSighash("swapOnZeroXv4WithPermit"),
      zeroxv4.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "ZeroxV4Router",
        address: zeroxv4.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: zeroxv4.address,
        constructorArguments: [config.WETH],
      });
    }
  }
};
export default func;
func.tags = ["ZeroxV4Router"];
