import hre, { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";
import { getConfig } from "../config";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({ getNamedAccounts, deployments, getChainId }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("AvalancheAdapter02");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt("AugustusSwapper", augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const args: string[] = [config.WAVAX as string];
  const networkName = hre.network.name;

  const result = await deploy("AvalancheAdapter02", {
    from: deployer,
    contract: {
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      deployedBytecode: artifact.deployedBytecode,
    },
    args,
    log: true,
    skipIfAlreadyDeployed: true,
  });
  if (result.newlyDeployed) {
    await waitforme(20000);

    const adapter02 = await deployments.get("AvalancheAdapter02");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter02.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "AvalancheAdapter02",
        address: adapter02.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: adapter02.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["AvalancheAdapter02"];
