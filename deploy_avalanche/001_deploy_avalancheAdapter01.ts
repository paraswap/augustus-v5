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
  const artifact = await deployments.getArtifact("AvalancheAdapter01");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt("AugustusSwapper", augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const args = [
    config.WAVAX,
    config.AAVEE_AFFILIATE_CODE,
    config.AVEE_LENDING_POOL,
    config.AVEE_WETH_GATEWAY,
    config.AAVE_V3_REF_CODE,
    config.AAVE_V3_POOL,
    config.AAVE_V3_WETH_GATEWAY,
  ];
  const networkName = hre.network.name;

  const result = await deploy("AvalancheAdapter01", {
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

    const adapter01 = await deployments.get("AvalancheAdapter01");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter01.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "AvalancheAdapter01",
        address: adapter01.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);

      await hre.run("verify:verify", {
        address: adapter01.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["AvalancheAdapter01"];
