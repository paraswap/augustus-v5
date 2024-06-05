import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { waitforme } from "../helpers/utils";
import { augustusFake } from "../src/augustus-fake";
import { augustusWrapper } from "../src/augustus-wrapper";
import { getConfig } from "../config";

const SKIP_ADMIN_TX = process.env.SKIP_ADMIN_TX === "true";
const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  ethers,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const artifact = await deployments.getArtifact("Adapter04");
  const augustus = await deployments.get("AugustusSwapper");
  const augustusArtifact = await deployments.getArtifact("AugustusSwapper");
  const augustusInstance = await ethers.getContractAt(augustusArtifact.abi, augustus.address);
  const augustusAdmin = SKIP_ADMIN_TX ? augustusFake : augustusWrapper(augustusInstance);
  const chainId = await getChainId();
  const config = getConfig(chainId);

  const networkName = hre.network.name;
  const args = [config.WETH, config.MATIC, config.POL];

  const result = await deploy("Adapter04", {
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
    const adapter04 = await deployments.get("Adapter04");
    const role = await augustusInstance.WHITELISTED_ROLE();
    const tx = await augustusAdmin.grantRole(role, adapter04.address);
    await tx.wait();
    if (networkName === "tenderly") {
      await hre.tenderly.verify({
        name: "Adapter04",
        address: adapter04.address,
      });
    } else if (!["31337"].includes(chainId)) {
      await waitforme(20000);
      await hre.run("verify:verify", {
        address: adapter04.address,
        constructorArguments: args,
      });
    }
  }
};
export default func;
func.tags = ["Adapter04"];
