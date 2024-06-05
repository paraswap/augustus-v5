import { DeployFunction } from "hardhat-deploy/dist/types";
import hre, { ethers } from "hardhat";
import { getConfig } from "../config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("ZeroxV2Router");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusAdmin = SKIP_ADMIN_TX
    ? augustusFake
    : augustusWrapper(await ethers.getContractAt(augustusArtifact.abi, augustus.address));
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const networkName = hre.network.name;
  const result = await deploy("ZeroxV2Router", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args: [config.ZRX_ERC20_PROXY, config.WETH],
    log: true,
    skipIfAlreadyDeployed: true,
  });

  if (result.newlyDeployed) {
    const zeroxv2 = await deployments.get("ZeroxV2Router");
    const zeroxv2Instance = await ethers.getContractAt(artifact.abi, zeroxv2.address);
    const role = "0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2";
    let tx = await augustusAdmin.grantRole(role, zeroxv2.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(zeroxv2Instance.interface.getSighash("swapOnZeroXv2"), zeroxv2.address);
    await tx.wait();
    tx = await augustusAdmin.setImplementation(
      zeroxv2Instance.interface.getSighash("swapOnZeroXv2WithPermit"),
      zeroxv2.address,
    );
    await tx.wait();

    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "ZeroxV2Router",
        address: zeroxv2.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: zeroxv2.address,
        constructorArguments: [config.ZRX_ERC20_PROXY, config.WETH],
      });
    }
  }
};
export default func;
func.tags = ["ZeroxV2Router"];
