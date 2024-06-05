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
  const artifact = await deployments.getArtifact("BscAdapter01");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt("AugustusSwapper", augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);
  const args = [
    config.DODOV2_SWAP_LIMIT_OVERHEAD,
    config.DODOV2_ERC_20_PROXY,
    config.DODO_SWAP_LIMIT_OVERHEAD,
    config.DODO_ERC_20_PROXY,
    config.ZRXV2_ERC20_PROXY,
    config.WBNB,
  ];
  const networkName = hre.network.name;

  const result = await deploy("BscAdapter01", {
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

    const adapter01 = await deployments.get("BscAdapter01");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter01.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "BscAdapter01",
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
func.tags = ["BscAdapter01"];
